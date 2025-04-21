# Project Creation Form Documentation

## Overview

The project creation form is a multi-step form that guides users through creating a new project. It uses a state machine pattern for managing form state and validation, with robust error handling and recovery mechanisms.

## Key Components

- [Form State Machine](./state-machine.md) - Core form state management
- [Error Handling](./error-handling.md) - Centralized error handling system
- [Step Components](./steps.md) - Individual form step components
- [Validation](./validation.md) - Form validation system
- [Testing](./testing.md) - Testing guidelines and examples

## Quick Start

```tsx
import { CreateProjectForm } from '@/components/tenant/CreateProjectForm';
import { useProjectCreationForm } from '@/hooks/useProjectCreationForm';

function ProjectCreationPage() {
  const form = useProjectCreationForm();
  
  return (
    <CreateProjectForm form={form} />
  );
}
```

## Features

- Multi-step form with validation
- State machine for form flow control
- Centralized error handling
- Step isolation and error boundaries
- Loading states and progress indicators
- Form state persistence
- Error recovery mechanisms

## Best Practices

1. **State Management**
   - Use `useFormStateMachine` for form state
   - Keep form state centralized
   - Use proper state transitions

2. **Error Handling**
   - Use error boundaries for component errors
   - Handle validation errors consistently
   - Provide clear error messages
   - Enable error recovery

3. **Validation**
   - Validate at field, step, and form levels
   - Use type-safe validation rules
   - Provide immediate feedback
   - Enable async validation

4. **Components**
   - Keep components focused and isolated
   - Use `BaseStep` for consistency
   - Handle loading states properly
   - Implement proper cleanup

## Architecture

The form follows a layered architecture:

```
┌─────────────────┐
│  Form Component │
├─────────────────┤
│  State Machine  │
├─────────────────┤
│ Error Handling  │
├─────────────────┤
│   Validation    │
└─────────────────┘
```

See [Architecture Details](./architecture.md) for more information.

## Contributing

See our [Contributing Guide](../../contributing/CONTRIBUTING.md) for guidelines on making changes to the form components.