import { Request } from 'express';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  sessionId?: string;
  user?: SupabaseUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Cat {
  id: string;							// Unique cat identifier
  name: string;							// In-game name of the cat
  gender: 'male' | 'female';		
  moons: number;						// Age of the cat, in months (moons = month)
  skill: string;					
  trait: string;
  breed?: string;
  level: number;
  experience: number;
  max_level: number;					// Maximum level potential a cat can reach
  userId: string;						// Owner user of the cat
  createdAt: Date;						// When the cat was first created
  updatedAt: Date;						// When the cat was last updated
}

export interface User {
  id: string;							// Unique user identifier
  email: string;						// Email of the user
  username: string;						// Unique username of the user
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResources {
  id: string;							// Primary key
  userId: string;						// References User.id
  coins: number;						// Amount of coin currency
  daily_energy: number;					// Current energy points
  max_daily_energy: number;				// Maximum energy capacity
  energy_regen_rate_minutes: number;		// Minutes between energy regeneration
  last_energy_update: Date;				// Last time energy was updated
  createdAt: Date;
  updatedAt: Date;
}


