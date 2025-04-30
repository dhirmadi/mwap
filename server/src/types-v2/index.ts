// Re-export all types
export * from './auth';
export * from './express';
export * from './projects';
export * from './tenants';

// Base entity type
export interface BaseEntity {
  /** Entity ID */
  id: string;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

// Common response types
export type ApiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
} | {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

// Pagination parameters
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;
  
  /** Items per page */
  limit?: number;
  
  /** Sort field */
  sortBy?: string;
  
  /** Sort direction */
  sortDir?: 'asc' | 'desc';
}

// Pagination metadata
export interface PaginationMeta {
  /** Current page */
  page: number;
  
  /** Items per page */
  limit: number;
  
  /** Total items */
  total: number;
  
  /** Total pages */
  pages: number;
  
  /** Has more pages */
  hasMore: boolean;
}