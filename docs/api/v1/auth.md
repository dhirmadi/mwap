# Authentication API Documentation

## Overview
The authentication system uses Auth0 for secure user authentication and authorization. It implements the Authorization Code Flow with PKCE for Single Page Applications.

## Endpoints

### GET /api/v1/auth/me
Get the current user's profile information.

**Authentication Required**: Yes

**Response**:
```json
{
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "picture": "string",
    "roles": ["string"],
    "tenantId": "string"
  },
  "meta": {
    "requestId": "string"
  }
}
```

### POST /api/v1/auth/refresh
Refresh the current access token.

**Authentication Required**: Yes (Refresh Token)

**Response**:
```json
{
  "data": {
    "accessToken": "string",
    "expiresIn": number
  },
  "meta": {
    "requestId": "string"
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token",
    "requestId": "string"
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Insufficient permissions",
    "requestId": "string"
  }
}
```

## Auth0 Configuration

### Required Settings
```env
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_AUDIENCE=your-auth0-api-identifier
```

### Callback URLs
- Development: http://localhost:5173
- Production: https://*.herokuapp.com

### Allowed Origins
- Development: http://localhost:5173
- Production: https://*.herokuapp.com

## Role-Based Access Control

### Available Roles
- OWNER: Full tenant access
- ADMIN: Project management access
- MEMBER: Basic access

### Role Hierarchy
```typescript
export const TENANT_ROLE_HIERARCHY = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1
};
```

## Security Considerations
1. Always use HTTPS in production
2. Implement proper CORS configuration
3. Use secure session handling
4. Implement rate limiting
5. Monitor for suspicious activities