// Jest setup file for user resources tests

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';
process.env.NODE_ENV = 'test';

// Increase test timeout for database operations
jest.setTimeout(10000);