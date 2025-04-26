# Standardize Project Roles with Tenant Roles

## Overview
Standardize project roles to match tenant roles for better consistency:
- Change `ADMIN` to `OWNER`
- Change `CONTRIBUTOR` to `MEMBER`
- Keep `DEPUTY` as is

## Background
Currently, projects and tenants use different role terminology:
- Tenants: `OWNER`, `ADMIN`, `MEMBER`
- Projects: `ADMIN`, `DEPUTY`, `CONTRIBUTOR`

This creates unnecessary cognitive load and inconsistency in the codebase.

## Changes Required

### Backend Changes

#### 1. Project Role Definitions
- [ ] Update `/server/src/features/projects/types/roles.ts`:
  ```typescript
  enum ProjectRole {
    OWNER = 'OWNER',    // Changed from ADMIN
    DEPUTY = 'DEPUTY',  // Unchanged
    MEMBER = 'MEMBER'   // Changed from CONTRIBUTOR
  }
  ```

#### 2. Schema Updates
- [ ] Update `/server/src/features/projects/schemas/index.ts`:
  - Update ProjectRole enum
  - Update any role validation logic
  - Update role hierarchy constants

#### 3. Controller Updates
- [ ] Update `/server/src/features/projects/controllers/index.ts`:
  - Update role assignment in project creation (already uses 'owner')
  - Update role checks in permission validation
  - Update role references in logs and error messages

- [ ] Update `/server/src/features/projects/controllers/members.controller.ts`:
  - Update role assignment logic
  - Update role validation checks
  - Update error messages

#### 4. Permission Service
- [ ] Update `/server/src/features/permissions/services/permission.service.ts`:
  - Update role hierarchy checks
  - Update permission matrices
  - Update role comparison logic

#### 5. Middleware Updates
- [ ] Update `/server/src/core/middleware/auth.ts`:
  - Update role checking logic
  - Update permission validation

### Frontend Changes

#### 1. Type Definitions
- [ ] Update `/client/src/types/project/index.ts`:
  - Update ProjectRole enum
  - Update related interfaces

#### 2. Hook Updates
- [ ] Update `/client/src/hooks/useProjectRole.ts`:
  - Update role checking logic
  - Update role comparison functions
  - Update return types

#### 3. API Integration
- [ ] Update `/client/src/core/api/paths.ts`:
  - Update any role-specific endpoint handling
  - Update request/response types

### Documentation Updates

#### 1. API Documentation
- [ ] Update `/docs/api/v1/projects.md`:
  - Update role definitions
  - Update permission matrices
  - Update example responses
  - Update error documentation

#### 2. Permission Documentation
- [ ] Update `/docs/permissions.md`:
  - Update role hierarchy documentation
  - Update permission examples
  - Update role comparison logic

## Areas for Further Simplification

1. Permission Logic Consolidation
   - Could create shared role validation logic between tenants and projects
   - Could unify permission checking interfaces

2. Type Definition Consolidation
   - Could create base role types shared between tenants and projects
   - Could share member interface definitions

3. Middleware Consolidation
   - Could create unified role checking middleware
   - Could share permission validation logic

4. Documentation Consolidation
   - Could create unified role documentation
   - Could share permission matrix templates

## Implementation Notes

### No Migration Needed
- No existing projects in the database
- Clean slate for implementation

### Consistency Benefits
1. Unified terminology across the application
2. Simplified mental model for users
3. More maintainable codebase
4. Better alignment with DRY principles

### Code Organization
- All changes are isolated to project-related files
- No changes needed in tenant-related code
- Clear separation of concerns maintained

## Success Criteria
1. All project role references updated consistently
2. No remaining references to old role names
3. Documentation fully updated
4. Frontend and backend perfectly aligned
5. No orphaned role-related code

## Related Files
- No changes needed to test files (no tests yet)
- No changes needed to migration files (no existing data)
- No changes needed to tenant-related files

## Labels
- enhancement
- no-migration-needed
- role-management
- standardization