# MWAP API Documentation

## Overview

The MWAP API provides a RESTful interface for managing user data and authentication. The API uses JWT tokens for authentication, provided by Auth0.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-app.herokuapp.com/api
```

## Authentication

The API uses Auth0 for authentication. All authenticated endpoints require a valid JWT token in the Authorization header.

### Authentication Header

```
Authorization: Bearer <your_jwt_token>
```

### JWT Token Requirements

- **Algorithm**: RS256
- **Issuer**: https://your-auth0-domain/
- **Audience**: Your Auth0 API Audience
- **Scope**: Depends on the endpoint requirements

## Error Handling

The API uses conventional HTTP response codes to indicate success or failure of requests.

### Response Codes

- `200 OK`: Request succeeded
- `400 Bad Request`: Invalid request format or parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Valid authentication but insufficient permissions
- `404 Not Found`: Requested resource not found
- `500 Internal Server Error`: Server-side error

### Error Response Format

```json
{
  "message": "Error description",
  "error": "Detailed error message (if available)"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Current limits are:
- 100 requests per minute per IP address
- Rate limit headers are included in responses

### Rate Limit Headers

```
X-RateLimit-Limit: Maximum number of requests allowed per window
X-RateLimit-Remaining: Number of requests remaining in current window
X-RateLimit-Reset: Time when the rate limit window resets (Unix timestamp)
```

## Endpoints

### User Profile

#### Get Current User Profile
Retrieves the profile information of the authenticated user.

```
GET /api/users/me
```

**Authentication Required**: Yes

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK)**:
```json
{
  "id": "auth0|1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://example.com/profile.jpg"
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "message": "No authentication information found"
}
```

500 Internal Server Error:
```json
{
  "message": "Error fetching user info",
  "error": "Detailed error message"
}
```

## Data Types

### UserProfile

```typescript
interface UserProfile {
  id: string;        // Auth0 user ID (sub)
  email?: string;    // User's email address
  name?: string;     // User's full name
  picture?: string;  // URL to user's profile picture
}
```

### Auth0Claims

```typescript
interface Auth0Claims {
  sub: string;       // Auth0 subject identifier
  email?: string;    // User's email address
  name?: string;     // User's full name
  picture?: string;  // URL to profile picture
  [key: string]: any; // Other Auth0 claims
}
```

## Security

### CORS

The API implements CORS (Cross-Origin Resource Sharing) with the following default configuration:
- Allowed origins: Configurable via environment variables
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Authorization, Content-Type
- Credentials: Supported

### Security Headers

The API uses Helmet.js to set various security headers:
- Content Security Policy (CSP)
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy
- and more...

## Environment Configuration

The API requires the following environment variables:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (if applicable)
MONGODB_URI=your-mongodb-connection-string
```

## Development and Testing

### Local Development

1. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Testing the API

You can test the API using tools like cURL, Postman, or the included API test suite.

Example cURL request:
```bash
curl -X GET \
  http://localhost:3000/api/users/me \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Error Codes and Messages

| Code | Message | Description |
|------|---------|-------------|
| 401  | No authentication information found | JWT token is missing or invalid |
| 500  | Error fetching user info | Server encountered an error processing the request |

## Rate Limiting Implementation

The API uses express-rate-limit with the following default configuration:

```typescript
{
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
}
```

## Future API Endpoints (Planned)

The following endpoints are planned for future releases:

1. User Profile Management
   ```
   PUT /api/users/me - Update user profile
   PATCH /api/users/me - Partial update user profile
   ```

2. User Preferences
   ```
   GET /api/users/me/preferences - Get user preferences
   PUT /api/users/me/preferences - Update user preferences
   ```

## Support and Contact

For API support and questions, please:
1. Check the documentation
2. Review common issues in the repository
3. Open an issue on GitHub
4. Contact the development team

## Changelog

### Version 1.0.0
- Initial API release
- User profile endpoint
- Auth0 integration
- Rate limiting
- Security headers