# Tenant Management Documentation - MWAP (Updated April 2025)

## Purpose

The Tenant Management system allows users to create workspaces (tenants), manage projects, and integrate cloud storage providers.
Projects link to specific cloud storage folders and establish their own member lists.

---

## Key Principles

- Users **do not** automatically own tenants upon signup.
- A user may own **exactly one tenant**.
- Projects belong to a tenant and are **isolated units** with:
  - One cloud provider
  - One cloud folder
  - Independent member lists
- Cloud providers are connected at the tenant level.

---

## Entities

### 1. Tenant

- Created when a user starts a workspace.
- Fields:
  - `ownerId` (User reference)
  - `name`
  - `createdAt`
  - `integrations` (Array of connected cloud providers)

- Supports:
  - Cloud provider integration (connect/disconnect).
  - Name updates.
  - Archival (soft-delete).

---

### 2. Project

- Always belongs to one tenant.
- Fields:
  - `tenantId` (Reference to Tenant)
  - `name`
  - `cloudProvider` (One selected provider)
  - `folderId` (Selected cloud folder ID)
  - `members` (Array of `{ userId, role }`)
  - `createdAt`
  - `archived` (Boolean flag)

- When a project is created:
  - The tenant owner is automatically added to the `members` array as an `ADMIN`.

- Roles inside a project:
  | Role | Permissions |
  |:--|:--|
  | ADMIN | Full control (manage members, archive project) |
  | DEPUTY | Manage some project settings, invite others |
  | CONTRIBUTOR | Access project resources only |

- **Note**:
  - Only one cloud provider and one folder can be linked.
  - Folder/provider cannot be changed after project creation.

---

## Tenant Workflows

### Create Tenant

- User chooses "Start a Workspace."
- A tenant document is created with:
  - Owner reference
  - Empty integrations initially

---

### Manage Cloud Integrations

- Connect to Google Drive, Dropbox, Box, or OneDrive.
- Disconnection possible via tenant settings.
- Providers authenticate via OAuth and list available folders.

---

## Project Workflows

### Create Project

- Step 1: Enter project name.
- Step 2: Select cloud provider (must already be connected).
- Step 3: Browse and select one folder.
- Step 4: Confirm.

Upon creation:
- The tenant owner is added as the first `ADMIN` member.

### Update Project

- Can **rename** the project name.
- Cannot change:
  - Cloud provider
  - Folder

### Archive Project

- Marks `archived = true`.
- Becomes read-only.

---

## Notes and Clarifications

- Member roles and permissions are managed **inside each project**.
- Invites are created and redeemed **per project**, not at tenant level.
- Only **tenant owners** create initial projects.
- **New projects** always start with one `ADMIN` user: the tenant owner.

---

## Future Considerations

- Allow Deputy promotion to Admin by Owner.
- Recovery of archived projects.
- Multi-folder linking (future expansion).