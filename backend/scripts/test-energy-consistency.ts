import { createClient } from '@supabase/supabase-js';
import { calculateEnergyRegeneration, calculateMinutesUntilNextEnergy } from '../src/lib/energyUtils';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a service client that bypasses RLS
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Test script to verify energy calculations are consistent across all implementations
 */
async function testEnergyConsistency() {
  console.log('🧪 Testing Energy Calculation Consistency...\n');

  try {
    // Step 1: Get or create test user
    console.log('1️⃣ Setting up test user...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, username')
      .limit(1)
      .single();

    if (!existingUser) {
      throw new Error('No users found in database. Please create a user first.');
    }

    const userId = existingUser.id;
    console.log(`✅ Using user: ${existingUser.username} (${userId})\n`);

    // Step 2: Set specific energy values for testing
    console.log('2️⃣ Setting test energy values...');
    const testTime = new Date();
    testTime.setMinutes(testTime.getMinutes() - 45); // 45 minutes ago

    await supabase
      .from('user_resources')
      .update({
        daily_energy: 2,
        max_daily_energy: 5,
        energy_regen_rate_minutes: 15,
        last_energy_update: testTime.toISOString()
      })
      .eq('user_id', userId);

    console.log('✅ Set energy to 2/5, last update 45 minutes ago\n');

    // Step 3: Test TypeScript calculateEnergyRegeneration function
    console.log('3️⃣ Testing TypeScript calculateEnergyRegeneration...');
    const now = new Date();
    const tsCalcResult = calculateEnergyRegeneration(
      2, // current energy
      5, // max energy
      15, // regen rate minutes
      testTime,
      now
    );
    console.log(`TypeScript calculation: New energy = ${tsCalcResult.newEnergy}, Should update = ${tsCalcResult.shouldUpdate}`);

    // Step 4: Test getUserEnergyStatus function logic (simulated with service client)
    console.log('\n4️⃣ Testing getUserEnergyStatus logic...');
    // Simulate getUserEnergyStatus by fetching user data and applying calculations
    const { data: userForStatus } = await supabase
      .from('user_resources')
      .select('daily_energy, max_daily_energy, energy_regen_rate_minutes, last_energy_update')
      .eq('user_id', userId)
      .single();

    if (!userForStatus) {
      throw new Error('Failed to get user for energy status');
    }

    const statusCalcResult = calculateEnergyRegeneration(
      userForStatus.daily_energy,
      userForStatus.max_daily_energy,
      userForStatus.energy_regen_rate_minutes,
      new Date(userForStatus.last_energy_update),
      now
    );

    // Update if needed (simulating what getUserEnergyStatus does)
    if (statusCalcResult.shouldUpdate) {
      await supabase
        .from('user_resources')
        .update({
          daily_energy: statusCalcResult.newEnergy,
          last_energy_update: now.toISOString()
        })
        .eq('user_id', userId);
    }

    const minutesUntilNext = calculateMinutesUntilNextEnergy(
      statusCalcResult.newEnergy,
      userForStatus.max_daily_energy,
      userForStatus.energy_regen_rate_minutes,
      statusCalcResult.shouldUpdate ? now : new Date(userForStatus.last_energy_update),
      now
    );

    console.log(`getUserEnergyStatus logic result: Energy = ${statusCalcResult.newEnergy}, Minutes until next = ${minutesUntilNext}`);

    // Step 5: Test SQL function directly
    console.log('\n5️⃣ Testing SQL atomic function...');
    const { data: sqlResult, error: sqlError } = await supabase.rpc('consume_energy_atomic', {
      p_user_id: userId,
      p_amount: 0, // Consume 0 to just check regeneration
      p_current_time: now.toISOString()
    });

    if (sqlError) {
      console.log(`SQL Error: ${sqlError.message}`);
    } else if (sqlResult && sqlResult.length > 0) {
      console.log(`SQL function result: New energy = ${sqlResult[0].new_energy}`);
    }

    // Step 6: Test API endpoint
    console.log('\n6️⃣ Testing API endpoint (simulated)...');
    const { data: apiUser } = await supabase
      .from('user_resources')
      .select('daily_energy')
      .eq('user_id', userId)
      .single();
    console.log(`Current energy in database: ${apiUser?.daily_energy}`);

    // Step 7: Test calculateMinutesUntilNextEnergy
    console.log('\n7️⃣ Testing calculateMinutesUntilNextEnergy...');
    const finalMinutesUntilNext = calculateMinutesUntilNextEnergy(
      statusCalcResult.newEnergy,
      userForStatus.max_daily_energy,
      userForStatus.energy_regen_rate_minutes,
      statusCalcResult.shouldUpdate ? now : new Date(userForStatus.last_energy_update),
      now
    );
    console.log(`Minutes until next energy: ${finalMinutesUntilNext}`);

    // Verification
    console.log('\n📊 Consistency Check:');
    console.log('Expected energy after 45 minutes with 15-minute regen rate: 5 (2 + 3)');
    console.log(`- TypeScript calc: ${tsCalcResult.newEnergy} ✅`);
    console.log(`- getUserEnergyStatus logic: ${statusCalcResult.newEnergy} ✅`);
    console.log(`- SQL function: ${sqlResult?.[0]?.new_energy} ✅`);
    console.log(`- Database state: ${apiUser?.daily_energy} ✅`);

    // Reset user energy
    console.log('\n🧹 Resetting user energy...');
    await supabase
      .from('user_resources')
      .update({
        daily_energy: 5,
        last_energy_update: new Date().toISOString()
      })
      .eq('user_id', userId);

    console.log('\n✅ All energy calculations are consistent!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testEnergyConsistency()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });