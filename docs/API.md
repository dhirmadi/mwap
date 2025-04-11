# MWAP API Documentation

## Authentication
All routes require authentication using Auth0. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Tenant Management
### Create Tenant
```
POST /tenant
Authorization: Required
Body: { name: string }
Response: { tenantId: string, name: string, ... }
```
- One tenant per user
- Returns 400 if user already has a tenant

### Get Current Tenant
```
GET /tenant/me
Authorization: Required
Response: { id: string, name: string, ownerId: string, ... }
```

## Project Management
### Create Project
```
POST /projects
Authorization: Required + Tenant Owner
Body: { name: string }
Response: { projectId: string, name: string, ... }
```

### List Projects
```
GET /projects?page=1&limit=20
Authorization: Required
Response: {
  projects: Array<Project>,
  pagination: { page: number, limit: number, total: number }
}
```
- Returns only non-archived projects where user is a member
- Default page size: 20, max: 100

### Get Project
```
GET /projects/:id
Authorization: Required + Project Member
Response: { id: string, name: string, members: Array<Member>, ... }
```

### Update Project
```
PATCH /projects/:id
Authorization: Required + Project Admin
Body: { name?: string }
Response: { id: string, name: string, ... }
```

### Delete Project
```
DELETE /projects/:id
Authorization: Required + Project Admin
Response: { message: string }
```
- Soft deletes by setting archived=true

## Project Members
### Update Member Role
```
PATCH /projects/:id/members/:userId
Authorization: Required + Project Admin/Deputy
Body: { role: "admin" | "deputy" | "contributor" }
Response: { members: Array<Member> }
```
- Cannot modify own role
- Cannot promote beyond own role level

### Remove Member
```
DELETE /projects/:id/members/:userId
Authorization: Required + Project Admin/Deputy
Response: { message: string }
```
- Cannot remove self
- Cannot remove members with higher role

## Invites
### Create Invite
```
POST /invites
Authorization: Required + Project Admin/Deputy
Body: {
  projectId: string,
  role: "admin" | "deputy" | "contributor",
  expiresIn?: number // seconds, default: 1h, max: 24h
}
Response: { code: string, expiresAt: string }
```

### Redeem Invite
```
POST /invites/redeem
Authorization: Required
Body: { code: string }
Response: { projectId: string, role: string }
```
- Single-use codes
- Validates expiration

## Super Admin
### List All Tenants
```
GET /admin/tenants?page=1&limit=20
Authorization: Required + Super Admin
Response: {
  tenants: Array<Tenant>,
  pagination: { page: number, limit: number, total: number }
}
```

### List All Projects
```
GET /admin/projects?page=1&limit=20
Authorization: Required + Super Admin
Response: {
  projects: Array<Project>,
  pagination: { page: number, limit: number, total: number }
}
```

### Archive Tenant
```
PATCH /admin/tenant/:id/archive
Authorization: Required + Super Admin
Response: { message: string }
```
- Archives tenant and all its projects