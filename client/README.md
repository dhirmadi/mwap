# MWAP Client

Modern web application client built with React, TypeScript, and Vite.

## Features

### Core Technologies
- **React 18**: Latest React features and improvements
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast development server and optimized builds
- **Auth0**: Secure authentication with PKCE flow
- **Mantine UI**: Modern UI components and theming
- **React Router**: Client-side routing

### API Infrastructure
- **Type-Safe API Client**: 
  - Automatic error handling
  - Request/response type inference
  - Retry logic with exponential backoff
  - Auth token management
  - Request timeout handling

### Error Handling
- **Centralized Error System**:
  - Type-safe error hierarchy
  - Consistent error transformation
  - Field-level validation errors
  - Error logging and formatting
  - Error boundary integration

### Data Management
- **React Query Integration**:
  - Automatic caching and revalidation
  - Optimistic updates
  - Background refetching
  - Infinite queries
  - Mutation handling

### Type Safety
- **Comprehensive Type System**:
  - API response types
  - Error types
  - Component props
  - Hook results
  - Strict null checks

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy example environment file
   cp .env.example .env

   # Fill in the values:
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=your-api-identifier
   VITE_API_URL=http://localhost:54014/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Infrastructure

### API Client

The application uses a centralized API client with the following features:

```typescript
// Type-safe request methods
const api = useApi();
const data = await get<ResponseType>(api, '/endpoint');
const result = await post<ResponseType, RequestType>(api, '/endpoint', data);

// Automatic error handling
try {
  await api.get('/endpoint');
} catch (error) {
  // Error is already transformed to AppError
  if (error instanceof ValidationError) {
    // Handle validation errors
  }
}

// Retry configuration
const api = useApi({
  retry: {
    count: 3,
    delay: 1000,
    statusCodes: [408, 429, 500, 502, 503, 504]
  }
});
```

### Error Handling

Centralized error handling system:

```typescript
// Error hierarchy
class AppError extends Error {}
class ApiError extends AppError {}
class ValidationError extends AppError {}
class AuthError extends AppError {}

// Error transformation
const error = handleApiError(unknownError);
console.error(formatErrorForLogging(error));
showErrorToast(formatErrorMessage(error));

// Type guards
if (isValidationError(error)) {
  const fieldError = error.getFieldError('field');
}
```

### Data Management

React Query integration with caching:

```typescript
// Query configuration
const QUERY_CONFIG = {
  tenant: {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 30 * 60 * 1000  // 30 minutes
  }
} as const;

// Query hook
function useTenant() {
  return useQuery({
    queryKey: ['tenant'],
    queryFn: () => get<TenantResponse>(api, '/tenant/me'),
    ...QUERY_CONFIG.tenant
  });
}

// Mutation with cache invalidation
const mutation = useMutation({
  mutationFn: (data) => post<Response, Request>(api, '/endpoint', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tenant'] });
  }
});
```

## Auth0 Integration

The application uses Auth0 for authentication with the following features:

- Authorization Code flow with PKCE
- Automatic token refresh
- Secure token storage
- Profile management
- Role-based access control

### Auth0 Setup

1. Create an Auth0 application (Single Page Application)
2. Configure the following URLs:
   ```
   Allowed Callback URLs:
   - http://localhost:5173
   - https://*.herokuapp.com

   Allowed Logout URLs:
   - http://localhost:5173
   - https://*.herokuapp.com

   Allowed Web Origins:
   - http://localhost:5173
   - https://*.herokuapp.com
   ```

3. Enable the following features:
   - PKCE (default for SPAs)
   - Refresh Tokens
   - ID Tokens

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
