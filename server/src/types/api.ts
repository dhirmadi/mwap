// User-related types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Auth-related types
export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  environment: string;
  timestamp: string;
  uptime: number;
}

// Error response type
export interface ErrorResponse {
  message: string;
  error?: string;
  code?: string;
}