import { config } from 'dotenv';
import { supabase } from '../src/lib/supabase';

// Load environment variables
config();

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...\n');
  
  try {
    // Test database connection by querying tables
    const { error } = await supabase
      .from('users')
      .select('count')
      .single();
    
    if (error && error.code === '42P01') {
      console.log('❌ Tables not found. You need to run the migration first.');
      console.log('\nTo run the migration:');
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/njbbmbnortshicuwzybd');
      console.log('2. Click on "SQL Editor" in the left sidebar');
      console.log('3. Click "New query"');
      console.log('4. Copy and paste the contents of: backend/supabase/migrations/20240101000000_initial_schema.sql');
      console.log('5. Click "Run" to execute the migration\n');
    } else if (error) {
      console.log('❌ Connection error:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('✅ Database tables are set up correctly!');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function testAuthFlow() {
  console.log('\nTesting authentication flow...\n');
  
  try {
    // Generate unique test email with shorter timestamp
    const timestamp = Date.now().toString().slice(-8);
    const testEmail = `test.user+${timestamp}@example.com`;
    
    // Test signup
    console.log('1. Testing signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          username: 'testuser'
        }
      }
    });
    
    if (signupError) {
      console.log('❌ Signup error:', signupError.message);
      return;
    }
    
    console.log('✅ Signup successful!');
    console.log('   User ID:', signupData.user?.id);
    console.log('   Email:', signupData.user?.email);
    
    // Test signin
    console.log('\n2. Testing signin...');
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'testpassword123'
    });
    
    if (signinError) {
      console.log('❌ Signin error:', signinError.message);
      return;
    }
    
    console.log('✅ Signin successful!');
    console.log('   Access token:', signinData.session?.access_token?.substring(0, 20) + '...');
    
    // Test creating a cat with the authenticated user
    console.log('\n3. Testing cat creation...');
    const { data: catData, error: catError } = await supabase
      .from('cats')
      .insert({
        name: 'Test Cat',
        gender: 'female',
        moons: 12,
        skill: 'hunting',
        trait: 'brave',
        user_id: signupData.user!.id
      })
      .select()
      .single();
    
    if (catError) {
      console.log('❌ Cat creation error:', catError.message);
    } else {
      console.log('✅ Cat created successfully!');
      console.log('   Cat ID:', catData.id);
      console.log('   Name:', catData.name);
    }
    
    // Clean up - delete test user
    console.log('\n4. Cleaning up test data...');
    if (signupData.user) {
      // Note: This requires admin privileges
      console.log('   (Test user will remain in database - manual cleanup needed)');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

async function runTests() {
  console.log('=== Supabase Backend Test Suite ===\n');
  
  await testSupabaseConnection();
  
  // Only run auth tests if connection is successful
  const { error } = await supabase.from('users').select('count').single();
  if (!error || error.code !== '42P01') {
    await testAuthFlow();
  }
  
  console.log('\n=== Tests Complete ===');
}

runTests();