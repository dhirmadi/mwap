export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    data?: any;
    requestId?: string;
  };
}

export interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: "VALIDATION_ERROR";
    message: string;
    data: {
      field: string;
      message: string;
    }[];
    requestId?: string;
  };
}

export interface SuccessResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;