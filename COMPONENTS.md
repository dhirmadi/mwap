# MWAP Component Documentation

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

**Props:**
```typescript
interface Props {
  children: ReactNode;
}
```

**Features:**
- Configures Auth0 for Single Page Application (SPA)
- Uses Authorization Code Flow with PKCE
- Handles redirect callbacks
- Manages token caching and renewal
- Validates required configuration

**Configuration Requirements:**
```typescript
VITE_AUTH0_DOMAIN: string
VITE_AUTH0_CLIENT_ID: string
VITE_AUTH0_AUDIENCE: string
```

**Usage Example:**
```tsx
<Auth0ProviderWithConfig>
  <App />
</Auth0ProviderWithConfig>
```

## Hooks

### useAuth
`src/hooks/useAuth.ts`

A custom hook that provides optimized authentication functionality and user state management.

**Returns:**
```typescript
interface AuthHookResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  user: AuthUser | null;
  getToken: () => Promise<string | null>;
  login: (returnTo?: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
```

**Features:**
- Token management with error handling
- User state transformation
- Navigation integration
- Error handling and logging
- Login state persistence
- Automatic token renewal

**Usage Example:**
```tsx
function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout {user?.name}</button>
      ) : (
        <button onClick={() => login()}>Login</button>
      )}
    </div>
  );
}
```

## Layout Components

### App
`src/App.tsx`

The main application shell component that provides the base layout and navigation structure.

**Features:**
- Responsive layout using Mantine AppShell
- Navigation header with authentication state
- User menu with profile and logout options
- Route configuration
- Conditional rendering based on auth state

**Key Components:**
- AppShell: Main layout container
- Header: Navigation and user controls
- Router: Route configuration
- User Menu: Profile and authentication actions

**Route Configuration:**
```typescript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/user/profile" element={<Profile />} />
</Routes>
```

## Page Components

### Home
`src/pages/Home.tsx`

The landing page component that displays welcome content and authentication state.

**Features:**
- Conditional rendering based on auth state
- Loading state handling
- Error state handling with retry options
- Responsive layout

**States:**
1. Loading State
2. Error State
3. Authenticated State
4. Unauthenticated State

**Usage:**
```tsx
<Route path="/" element={<Home />} />
```

### Profile
`src/pages/Profile.tsx`

User profile page that displays authenticated user information.

**Features:**
- Displays user profile information
- Handles loading and unauthorized states
- Shows verification status
- Displays detailed user metadata
- Responsive layout

**Displayed User Information:**
- Profile picture
- Name
- Email
- Email verification status
- Auth0 ID
- Nickname (if available)
- Locale (if available)
- Last update timestamp
- Raw profile data

**States:**
1. Loading State
2. Unauthorized State
3. Profile Display State

**Usage:**
```tsx
<Route path="/user/profile" element={<Profile />} />
```

## Component Best Practices

### 1. State Management
- Use `useAuth` hook for authentication state
- Implement loading states for async operations
- Handle error states gracefully
- Use TypeScript for type safety

### 2. Layout Guidelines
- Use Mantine components for consistent styling
- Implement responsive designs
- Follow container hierarchy
- Use proper spacing and alignment

### 3. Authentication Flow
- Always check authentication state
- Handle loading states
- Provide clear feedback for errors
- Implement proper redirects

### 4. Error Handling
- Display user-friendly error messages
- Provide retry options when appropriate
- Log errors for debugging
- Handle edge cases

### 5. Performance
- Implement loading states
- Use proper TypeScript types
- Optimize re-renders
- Handle cleanup in effects

## Component Dependencies

### UI Framework
- **Mantine Core**: Primary UI component library
- **Mantine Hooks**: Utility hooks
- **Mantine Form**: Form handling

### Icons
- **Tabler Icons**: Icon library

### Routing
- **React Router DOM**: Navigation and routing

### Authentication
- **Auth0 React**: Authentication provider

## Styling Guidelines

### 1. Mantine Theme
The application uses Mantine's theming system with the following conventions:

```typescript
// Theme configuration
{
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { xs: 2, sm: 4, md: 8, lg: 16, xl: 32 },
  colors: {
    // Custom color palette
  }
}
```

### 2. Component Spacing
- Use Mantine's spacing props (`m`, `p`, `gap`)
- Follow consistent spacing patterns
- Use responsive spacing values

### 3. Typography
- Use Mantine's typography components
- Follow heading hierarchy
- Use semantic text components

## Testing Components

### 1. Test Setup
```bash
npm run test
```

### 2. Test Files Location
```
src/
  __tests__/
    components/
    hooks/
    pages/
```

### 3. Testing Guidelines
- Test component rendering
- Test user interactions
- Test error states
- Test loading states
- Mock authentication state

## Future Improvements

### 1. Component Enhancements
- Add more profile customization options
- Implement user settings page
- Add data visualization components
- Enhance error handling components

### 2. Performance Optimizations
- Implement code splitting
- Add component lazy loading
- Optimize bundle size
- Add performance monitoring

### 3. Accessibility
- Add ARIA labels
- Implement keyboard navigation
- Add screen reader support
- Test with accessibility tools

### 4. Testing
- Add component unit tests
- Add integration tests
- Add end-to-end tests
- Add performance tests