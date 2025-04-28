# MWAP Component Documentation (Updated - April 2025)

## Table of Contents
1. [Providers](#providers)
2. [Hooks](#hooks)
3. [Layout Components](#layout-components)
4. [Page Components](#page-components)
5. [Component Best Practices](#component-best-practices)

## Providers

### Auth0ProviderWithConfig
`src/auth/Auth0Provider.tsx`

A configuration wrapper for Auth0 authentication that provides authentication services to the application.

✅ **Complete**

---

## Hooks

### useAuth
`src/hooks/useAuth.ts`

Custom hook for authentication functionality and user state management.

✅ **Complete**

---

### useCloudFolders
`src/hooks/useCloudFolders.ts`

Hook for listing folders from connected cloud providers.

📅 **(In progress)**

---

### useCloudIntegrations
`src/hooks/useCloudIntegrations.ts`

Hook for connecting and managing cloud provider tokens.

✅ **Complete**

---

## Layout Components

### App
`src/App.tsx`

Main application shell layout.

✅ **Complete**

---

### PageLayout
`src/components/layout/PageLayout.tsx`

Reusable page wrapper component.

✅ **Complete**

---

### ProfileLayout
`src/components/layout/ProfileLayout.tsx`

Reusable layout for profile-related pages.

✅ **Complete**

---

## Page Components

### Home
`src/pages/Home.tsx`

Landing page with authentication state management.

✅ **Complete**

---

### Profile
`src/pages/Profile.tsx`

User profile page displaying Auth0 information.

✅ **Complete**

---

### ProjectAdmin
`src/pages/ProjectAdmin.tsx`

Admin page for managing project settings, members, and access.

📅 **(In progress)**

---

### TenantAdmin
`src/pages/TenantAdmin.tsx`

Admin page for managing the tenant workspace, integrations, and projects.

📅 **(In progress)**

---

## Tenant Management Components

### TenantProjects
`src/components/tenant/TenantProjects.tsx`

Displays list of projects in a tenant.

✅ **Complete**

---

### CloudIntegrations
`src/components/tenant/CloudIntegrations.tsx`

UI for managing connected cloud providers (GDrive, Dropbox, Box, OneDrive).

✅ **Complete**

---

### ProjectFormModal
`src/components/tenant/ProjectFormModal.tsx`

Modal for project creation wizard (provider + folder steps).

📅 **(In progress)**

---

## Wizard Components

### Wizard
`src/components/wizard/Wizard.tsx`

General purpose multi-step wizard container.

✅ **Complete**

---

### WizardProvider
`src/components/wizard/WizardProvider.tsx`

Wizard context provider.

✅ **Complete**

---

### WizardStep
`src/components/wizard/WizardStep.tsx`

Individual step in a wizard.

✅ **Complete**

---

### WizardNavigation
`src/components/wizard/WizardNavigation.tsx`

Stepper UI navigation between steps.

✅ **Complete**

---

## Component Best Practices

- Always implement loading/error/empty states.
- Use Mantine components and spacing.
- Favor feature-based structure.
- Ensure TypeScript strict mode is respected.


