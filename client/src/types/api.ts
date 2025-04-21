/**
 * Generic API response interface
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Generic API error interface
 */
export interface ApiError extends Error {
  code: string;
  status: number;
  requestId?: string;
}