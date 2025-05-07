# System API

The System API provides system-level information and configuration.

## Get System Status

```http
GET /api/v2/system/status
```

Gets the current system status.

### Response

```typescript
{
  status: 'connected' | 'disconnected';  // Database connection status
  uptime: number;                        // Server uptime in seconds
  memory: {
    used: number;    // Used memory in bytes
    total: number;   // Total memory in bytes
  };
}
```

## Get System Version

```http
GET /api/v2/system/version
```

Gets the current system version information.

### Response

```typescript
{
  version: string;      // Semantic version (e.g. "2.0.0")
  buildNumber: string;  // Build number
  environment: string;  // Environment (e.g. "production", "staging")
  nodeVersion: string;  // Node.js version
}
```

## Get System Features

```http
GET /api/v2/system/features
```

Gets the enabled system features.

### Response

```typescript
{
  features: {
    oauth: {
      enabled: boolean;
      providers: string[];  // Enabled OAuth providers
    };
    storage: {
      enabled: boolean;
      providers: string[];  // Enabled storage providers
    };
    projects: {
      enabled: boolean;
      types: string[];     // Enabled project types
    };
    security: {
      mfa: boolean;        // Multi-factor auth enabled
      sso: boolean;        // Single sign-on enabled
    };
  };
}
```