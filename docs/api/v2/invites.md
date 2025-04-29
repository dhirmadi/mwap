# Invites API

Project invites allow project owners to invite users to their projects.

## Create Invite

```http
POST /api/v2/invites
```

Creates a new project invite.

### Request Body

```typescript
{
  projectId: string;  // Project ID
  email: string;     // Invitee email
  role: string;      // Project role (MEMBER, ADMIN)
  expiresAt?: Date;  // Optional expiration date
}
```

### Response

```typescript
{
  _id: string;
  projectId: string;
  email: string;
  role: string;
  code: string;      // Unique invite code
  redeemed: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Errors

- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Project not found
- `FORBIDDEN` - Not authorized to create invites
- `CONFLICT` - Active invite exists for email

## List Invites

```http
GET /api/v2/invites?projectId=:projectId
```

Lists invites for a project.

### Query Parameters

- `projectId` - Project ID (required)

### Response

```typescript
{
  invites: Array<{
    _id: string;
    projectId: string;
    email: string;
    role: string;
    code: string;
    redeemed: boolean;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### Errors

- `NOT_FOUND` - Project not found
- `FORBIDDEN` - Not authorized to list invites

## Redeem Invite

```http
POST /api/v2/invites/redeem
```

Redeems an invite code.

### Request Body

```typescript
{
  code: string;  // Invite code
}
```

### Response

```typescript
{
  invite: {
    _id: string;
    projectId: string;
    email: string;
    role: string;
    code: string;
    redeemed: true;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
  };
  project: {
    _id: string;
    name: string;
    // ... project details
  };
}
```

### Errors

- `NOT_FOUND` - Invalid invite code
- `VALIDATION_ERROR` - Email mismatch
- `CONFLICT` - Invite already redeemed or expired
- `FORBIDDEN` - Project archived