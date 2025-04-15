/**
 * Base metadata interface for all API responses
 * @property requestId - Unique identifier for the request
 * @property pagination - Optional pagination information
 */
export interface ResponseMetadata {
  readonly requestId: string;
  readonly pagination?: {
    readonly page?: number;
    readonly limit?: number;
    readonly total?: number;
    readonly sort?: string;
    readonly order?: 'asc' | 'desc';
  };
}

/**
 * Base success response wrapper
 * @template T - Type of the response data
 */
export interface SuccessResponse<T> {
  readonly data: T;
  readonly meta: ResponseMetadata;
}

/**
 * Base error response
 * @property error - Error details
 */
export interface ErrorResponseBase {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly requestId: string;
    readonly data?: unknown;
  };
}

/**
 * Validation error response with field-level errors
 */
export interface ValidationErrorResponse extends Omit<ErrorResponseBase, 'error'> {
  readonly error: {
    readonly code: 'VALIDATION_ERROR';
    readonly message: string;
    readonly requestId: string;
    readonly data: Array<{
      readonly field: string;
      readonly message: string;
    }>;
  };
}

/**
 * Union type of all possible API responses
 * @template T - Type of the success response data
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponseBase | ValidationErrorResponse;