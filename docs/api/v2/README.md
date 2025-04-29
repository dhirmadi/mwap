# MWAP API v2

The MWAP API v2 provides a more structured and secure way to interact with the platform. It includes improved validation, better error handling, and clearer separation of concerns.

## Core Features

- Strong schema validation using Zod
- Improved error handling with custom error types
- Strict tenant isolation
- Role-based access control
- Audit logging
- Rate limiting

## Services

The API is organized into the following services:

### Admin Services

- [Project Types](./admin/project-types.md) - Manage available project types
- [Cloud Providers](./admin/providers.md) - Configure cloud storage providers

### User Services

- [Tenants](./tenants.md) - Tenant management
- [Projects](./projects.md) - Project management
- [Invites](./invites.md) - Project invitations
- [Cloud](./cloud.md) - Cloud storage integration

### System Services

- [System](./system.md) - System status and configuration

## Authentication

All API endpoints require authentication using Auth0. The following headers are required:

```
Authorization: Bearer <access_token>
```

## Error Handling

Errors follow a consistent format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Missing or invalid credentials
- `FORBIDDEN` - Insufficient permissions
- `CONFLICT` - Resource conflict
- `INTERNAL_ERROR` - Server error

## Rate Limiting

API endpoints are rate limited based on:
- IP address
- User ID
- Endpoint path

Rate limit headers are included in responses:
```
X-RateLimit-Limit: requests per window
X-RateLimit-Remaining: remaining requests
X-RateLimit-Reset: reset timestamp
```