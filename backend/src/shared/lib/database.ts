export { supabase } from './supabase';
export type { 
	PostgrestError,
	PostgrestSingleResponse,
	PostgrestResponse,
	User,
	Session 
} from '@supabase/supabase-js';

/*
 * TODO: Future enhancements to consider:
 * 
 * 1. Generic CRUD Operations
 *    - create<T>(table: string, data: T): Promise<T>
 *    - findById<T>(table: string, id: string | number): Promise<T>
 *    - update<T>(table: string, id: string | number, data: Partial<T>): Promise<T>
 *    - remove(table: string, id: string | number): Promise<void>
 *    - findMany<T>(table: string, filters?: QueryFilters): Promise<T[]>
 * 
 * 2. Error Handling Utilities
 *    - isAuthError(error: unknown): boolean
 *    - isNetworkError(error: unknown): boolean
 *    - formatDatabaseError(error: PostgrestError): string
 *    - withErrorHandling<T>(fn: () => Promise<T>): Promise<Result<T>>
 * 
 * 3. Transaction Support
 *    - transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>
 *    - batchInsert<T>(table: string, items: T[]): Promise<T[]>
 *    - batchUpdate<T>(table: string, updates: UpdateItem<T>[]): Promise<T[]>
 * 
 * 4. Query Builder Helpers
 *    - paginatedQuery<T>(table: string, page: number, pageSize: number): QueryBuilder<T>
 *    - searchQuery<T>(table: string, searchTerm: string, columns: string[]): QueryBuilder<T>
 *    - withRelations<T>(query: QueryBuilder<T>, relations: string[]): QueryBuilder<T>
 * 
 * 5. Type-Safe Table References
 *    - const Tables = { cats: 'cats', clans: 'clans', ... } as const
 *    - type TableName = keyof typeof Tables
 *    - getTable<T>(name: TableName): Table<T>
 * 
 * 6. Caching Layer
 *    - cachedQuery<T>(key: string, query: () => Promise<T>, ttl?: number): Promise<T>
 *    - invalidateCache(pattern: string): void
 *    - clearCache(): void
 * 
 * 7. Real-time Subscriptions Wrapper
 *    - subscribe<T>(table: string, callback: (payload: T) => void): Subscription
 *    - subscribeToChanges<T>(table: string, filter: Filter, callback: ChangeCallback<T>): Subscription
 * 
 * 8. Database Health & Monitoring
 *    - checkConnection(): Promise<boolean>
 *    - getDatabaseMetrics(): Promise<DatabaseMetrics>
 *    - logQuery(table: string, operation: string, duration: number): void
 * 
 * 9. Migration Helpers
 *    - runMigration(sql: string): Promise<void>
 *    - getMigrationStatus(): Promise<MigrationStatus[]>
 * 
 * 10. Soft Delete Support
 *     - softDelete(table: string, id: string | number): Promise<void>
 *     - findWithDeleted<T>(table: string): Promise<T[]>
 *     - restore(table: string, id: string | number): Promise<void>
 */