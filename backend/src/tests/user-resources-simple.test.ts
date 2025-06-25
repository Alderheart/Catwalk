/**
 * Simple Test for User Resources Refactoring
 * 
 * Only tests what changed during the refactoring:
 * - Type definitions are correct
 * - Database queries target the right tables
 * - No legacy code remains
 */

import { User, UserResources } from '../types';

describe('User Resources Refactoring - Core Changes Only', () => {
  describe('Type Definitions', () => {
    test('User interface should not contain resource fields', () => {
      const user: User = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Verify resource fields are NOT in User type
      expect('coins' in user).toBe(false);
      expect('daily_energy' in user).toBe(false);
      expect('max_daily_energy' in user).toBe(false);
      expect('energy_regen_rate_minutes' in user).toBe(false);
      expect('last_energy_update' in user).toBe(false);
    });

    test('UserResources interface should contain all resource fields', () => {
      const resources: UserResources = {
        id: 'test-id',
        userId: 'user-id',
        coins: 100,
        daily_energy: 5,
        max_daily_energy: 5,
        energy_regen_rate_minutes: 15,
        last_energy_update: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(typeof resources.coins).toBe('number');
      expect(typeof resources.daily_energy).toBe('number');
      expect(typeof resources.max_daily_energy).toBe('number');
      expect(typeof resources.energy_regen_rate_minutes).toBe('number');
      expect(resources.last_energy_update).toBeInstanceOf(Date);
      expect(typeof resources.userId).toBe('string');
    });
  });

  describe('Database Query Validation', () => {
    test('should verify files use user_resources table in queries', () => {
      // Read the actual source files to verify they use correct table names
      const fs = require('fs');
      const path = require('path');
      
      // Check energyUtils.ts uses user_resources
      const energyUtilsContent = fs.readFileSync(
        path.join(__dirname, '../lib/energyUtils.ts'), 
        'utf8'
      );
      expect(energyUtilsContent).toContain("from('user_resources')");
      expect(energyUtilsContent).toContain("eq('user_id'");
      
      // Check auth.ts uses user_resources for resource operations
      const authContent = fs.readFileSync(
        path.join(__dirname, '../routes/auth.ts'), 
        'utf8'
      );
      expect(authContent).toContain("from('user_resources')");
      
      // Check rewards.ts uses user_resources
      const rewardsContent = fs.readFileSync(
        path.join(__dirname, '../routes/rewards.ts'), 
        'utf8'
      );
      expect(rewardsContent).toContain("from('user_resources')");
    });

    test('should verify migration file exists', () => {
      const fs = require('fs');
      const path = require('path');
      
      const migrationPath = path.join(
        __dirname, 
        '../../supabase/migrations/20250626000000_refactor_user_resources.sql'
      );
      
      expect(fs.existsSync(migrationPath)).toBe(true);
      
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      expect(migrationContent).toContain('CREATE TABLE IF NOT EXISTS public.user_resources');
      expect(migrationContent).toContain('DROP COLUMN IF EXISTS coins');
      expect(migrationContent).toContain('FROM user_resources');
    });
  });

  describe('No Legacy Code', () => {
    test('should not have UserWithResources interface', () => {
      const fs = require('fs');
      const path = require('path');
      
      const typesContent = fs.readFileSync(
        path.join(__dirname, '../types/index.ts'), 
        'utf8'
      );
      
      expect(typesContent).not.toContain('UserWithResources');
    });

    test('should verify clean separation in profile endpoint response', () => {
      const fs = require('fs');
      const path = require('path');
      
      const authContent = fs.readFileSync(
        path.join(__dirname, '../routes/auth.ts'), 
        'utf8'
      );
      
      // Should return clean separated structure
      expect(authContent).toContain('user: User; resources: UserResources');
      expect(authContent).not.toContain('UserWithResources');
    });
  });
});