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
  id: string;
  name: string;
  gender: 'male' | 'female';
  moons: number;
  skill: string;
  trait: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

