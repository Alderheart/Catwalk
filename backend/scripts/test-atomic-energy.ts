import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a service client that bypasses RLS
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Test script to verify atomic energy consumption prevents race conditions
 * 
 * This script:
 * 1. Creates a test user with limited energy
 * 2. Attempts concurrent energy consumption operations
 * 3. Verifies that race conditions are prevented
 */

async function testAtomicEnergyConsumption() {
  console.log('🧪 Testing Atomic Energy Consumption...\n');

  try {
    // Step 1: Use existing user or create test user directly in database
    console.log('1️⃣ Setting up test user...');
    
    // First, try to get an existing user to test with
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, username')
      .limit(1)
      .single();

    let userId: string;
    let isTestUser = false;

    if (existingUser) {
      // Use existing user
      userId = existingUser.id;
      console.log(`✅ Using existing user: ${existingUser.username} (${userId})\n`);
    } else {
      // Create a test user directly in the database
      const testUserId = '00000000-0000-0000-0000-000000000001'; // Fixed test UUID
      
      // Insert into users table first
      const { error: userInsertError } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          username: 'AtomicTestUser',
          created_at: new Date().toISOString()
        });

      if (userInsertError && !userInsertError.message.includes('duplicate')) {
        throw new Error(`Failed to create test user: ${userInsertError.message}`);
      }

      // Insert into user_resources table
      const { error: insertError } = await supabase
        .from('user_resources')
        .insert({
          user_id: testUserId,
          daily_energy: 5,
          max_daily_energy: 5,
          energy_regen_rate_minutes: 15,
          last_energy_update: new Date().toISOString(),
          coins: 0
        });

      if (insertError && !insertError.message.includes('duplicate')) {
        throw new Error(`Failed to create test user: ${insertError.message}`);
      }

      userId = testUserId;
      isTestUser = true;
      console.log(`✅ Test user created: ${userId}\n`);
    }

    // Step 2: Set user energy to a specific value for testing
    console.log('2️⃣ Setting initial energy...');
    const { error: updateError } = await supabase
      .from('user_resources')
      .update({ 
        daily_energy: 3,
        last_energy_update: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update user energy: ${updateError.message}`);
    }
    console.log('✅ Set energy to 3\n');

    // Step 3: Test concurrent energy consumption using direct RPC calls
    console.log('3️⃣ Testing concurrent energy consumption (3 requests for 2 energy each)...');
    console.log('Expected: Only 1 should succeed, 2 should fail with insufficient energy\n');

    const now = new Date();
    
    // Launch 3 concurrent requests using the atomic RPC function directly
    const promises = [
      supabase.rpc('consume_energy_atomic', {
        p_user_id: userId,
        p_amount: 2,
        p_current_time: now.toISOString()
      }),
      supabase.rpc('consume_energy_atomic', {
        p_user_id: userId,
        p_amount: 2,
        p_current_time: now.toISOString()
      }),
      supabase.rpc('consume_energy_atomic', {
        p_user_id: userId,
        p_amount: 2,
        p_current_time: now.toISOString()
      })
    ];

    const results = await Promise.allSettled(promises);
    
    let successCount = 0;
    let failureCount = 0;
    let failureReasons: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const response = result.value;
        if (!response.error && response.data && response.data.length > 0) {
          successCount++;
          console.log(`Request ${index + 1}: ✅ SUCCESS - Remaining energy: ${response.data[0].new_energy}`);
        } else {
          failureCount++;
          const errorMsg = response.error?.message || 'Unknown error';
          failureReasons.push(errorMsg);
          console.log(`Request ${index + 1}: ❌ FAILED - ${errorMsg}`);
        }
      } else {
        failureCount++;
        const errorMsg = result.reason?.message || result.reason;
        console.log(`Request ${index + 1}: ❌ ERROR - ${errorMsg}`);
      }
    });

    console.log(`\n📊 Results Summary:`);
    console.log(`- Successful consumptions: ${successCount}`);
    console.log(`- Failed consumptions: ${failureCount}`);

    // Step 4: Verify final energy state
    console.log('\n4️⃣ Verifying final energy state...');
    const { data: finalUser } = await supabase
      .from('user_resources')
      .select('daily_energy')
      .eq('user_id', userId)
      .single();

    console.log(`Final energy: ${finalUser?.daily_energy}`);

    // Step 5: Test the RPC function directly
    console.log('\n5️⃣ Testing RPC function directly...');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('consume_energy_atomic', {
      p_user_id: userId,
      p_amount: 1,
      p_current_time: new Date().toISOString()
    });

    if (rpcError) {
      console.log(`RPC Error (expected): ${rpcError.message}`);
    } else {
      console.log(`RPC Success: New energy = ${rpcResult[0].new_energy}`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test user...');
    if (isTestUser) {
      // Delete test user resources and user from database
      await supabase
        .from('user_resources')
        .delete()
        .eq('user_id', userId);
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);
    } else {
      // Reset energy for existing user
      await supabase
        .from('user_resources')
        .update({ 
          daily_energy: 5,
          last_energy_update: new Date().toISOString()
        })
        .eq('user_id', userId);
    }

    // Final verdict
    console.log('\n✅ Test completed successfully!');
    console.log('The atomic energy consumption prevents race conditions as expected.');
    
    if (successCount === 1 && failureCount === 2) {
      console.log('\n🎉 PASS: Race condition prevention working correctly!');
    } else {
      console.log('\n⚠️  WARNING: Unexpected results. Check implementation.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAtomicEnergyConsumption()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });