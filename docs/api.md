# MWAP API Documentation

## Overview

The MWAP API is a RESTful service that provides endpoints for tenant management, user authentication, and member management. This document outlines how to use the API services in the frontend application.

## API Client Setup

### Environment Configuration

The API client requires the following environment variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api  # Base URL for API requests
```

### Using the API Client

The application provides a centralized API client that handles:
- Authentication tokens
- Error handling
- Base URL configuration
- Request/response interceptors

```typescript
import { useApi } from '../services/api';

function YourComponent() {
  const api = useApi();
  
  // Make API calls
  const getData = async () => {
    const { data } = await api.get('/your-endpoint');
    return data;
  };
}
```

## Available Services

### User Service

Located in `src/features/tenants/services/userApi.ts`

```typescript
const { data } = await api.get<UserProfile>('/users/me');
```

Response type:
```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isSuperAdmin: boolean;
  tenants: Tenant[];
}
```

### Tenant Service

Located in `src/features/tenants/services/tenantApi.ts`

```typescript
// Join a tenant
const response = await api.post<TenantJoinResponse>(
  '/tenants/join',
  { code }
);

// Request a new tenant
const response = await api.post<TenantRequestResponse>(
  '/tenants/request',
  { name }
);
```

Response types:
```typescript
interface TenantJoinResponse {
  tenantId: string;
  name: string;
  role: TenantRole;
}

interface TenantRequestResponse {
  tenantId: string;
  status: 'pending' | 'approved' | 'rejected';
}
```

### Invite Service

Located in `src/features/tenants/services/inviteApi.ts`

```typescript
// Create an invite
const response = await api.post<InviteCodeResponse>(
  `/tenants/${tenantId}/invite`,
  request
);

// Get tenant members
const response = await api.get<{ members: Member[] }>(
  `/tenants/${tenantId}/members`
);
```

Types:
```typescript
interface CreateInviteRequest {
  email: string;
  role: TenantRole;
}

interface InviteCodeResponse {
  code: string;
  expiresAt: string;
}

interface Member {
  id: string;
  email: string;
  name: string;
  role: TenantRole;
  joinedAt: string;
}
```

## Error Handling

The API client automatically handles common error cases:

```typescript
try {
  const { data } = await api.get('/your-endpoint');
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('Network Error');
  } else {
    // Request setup failed
    console.error('Request Error:', error.message);
  }
}
```

## Best Practices

1. **Use Type Safety**:
   ```typescript
   // Always specify response types
   const { data } = await api.get<YourType>('/endpoint');
   ```

2. **Error Boundaries**:
   ```typescript
   // Wrap API calls in try-catch
   try {
     await api.post('/endpoint', data);
   } catch (error) {
     // Handle specific error cases
   }
   ```

3. **Loading States**:
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
   
   try {
     setIsLoading(true);
     await api.post('/endpoint', data);
   } finally {
     setIsLoading(false);
   }
   ```

4. **Environment Awareness**:
   - Always use the `VITE_API_URL` environment variable
   - Never hardcode API URLs
   - Use relative paths in API calls

## Adding New Endpoints

When adding new endpoints:

1. Create a new service file if needed:
   ```typescript
   import { useApi } from '../../../services/api';
   
   export const useNewFeatureApi = () => {
     const api = useApi();
     
     const newEndpoint = async () => {
       const { data } = await api.get<ResponseType>('/new-endpoint');
       return data;
     };
     
     return { newEndpoint };
   };
   ```

2. Define types for request/response:
   ```typescript
   interface RequestType {
     // request fields
   }
   
   interface ResponseType {
     // response fields
   }
   ```

3. Use the service in components:
   ```typescript
   const { newEndpoint } = useNewFeatureApi();
   ```

## Security Considerations

1. **Authentication**:
   - All API calls automatically include the Auth0 token
   - Protected routes require valid tokens

2. **CORS**:
   - API only accepts requests from allowed origins
   - Set proper CORS headers in development

3. **Data Validation**:
   - Validate request data before sending
   - Handle response data safely

## Testing API Calls

1. **Mock API Responses**:
   ```typescript
   jest.mock('../../../services/api', () => ({
     useApi: () => ({
       get: jest.fn(),
       post: jest.fn(),
     }),
   }));
   ```

2. **Test Error Cases**:
   ```typescript
   it('handles API errors', async () => {
     const error = new Error('API Error');
     api.get.mockRejectedValue(error);
     // Test error handling
   });
   ```
