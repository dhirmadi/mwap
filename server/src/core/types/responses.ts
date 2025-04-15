// Base error response type - all error responses must include these fields
export interface ErrorResponseBase {
  error: {
    code: string;
    message: string;
    requestId: string;  // Required since we always include it
    data?: unknown;     // More specific than any
  };
}

// Validation error response with specific data shape
export interface ValidationErrorResponse extends Omit<ErrorResponseBase, 'error'> {
  error: {
    code: "VALIDATION_ERROR";
    message: string;
    requestId: string;
    data: Array<{
      field: string;
      message: string;
    }>;
  };
}

// MongoDB duplicate key error response
export interface DuplicateKeyErrorResponse extends Omit<ErrorResponseBase, 'error'> {
  error: {
    code: "CONFLICT_ERROR";
    message: string;
    requestId: string;
    data: {
      field: string;
      value: unknown;
    };
  };
}

// Success response with generic data type and metadata
export interface SuccessResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;  // More specific than any
  };
}

// Union type of all possible API responses
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponseBase | ValidationErrorResponse | DuplicateKeyErrorResponse;

// Error types for external libraries
export interface MongoError {
  code: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
}

export interface MongoValidationError {
  name: 'ValidationError';
  errors: Record<string, {
    path?: string;
    message?: string;
  }>;
}

export interface ValidatorError {
  array: () => Array<{
    field: string;
    message: string;
    [key: string]: unknown;
  }>;
}