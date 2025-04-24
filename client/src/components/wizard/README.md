# Wizard Pattern Implementation

A reusable, type-safe wizard pattern for multi-step forms with validation, state management, and extensible architecture.

## Features

- Type-safe step configuration
- Centralized validation
- Enhanced state management
- Extensible architecture
- Navigation controls
- Error handling
- Loading states
- DRY implementation

## Installation

The wizard components are built on top of Mantine UI and use React hooks. No additional dependencies are required.

## Usage

### Basic Example

```tsx
import { WizardProvider, Wizard } from '@/components/wizard';
import { ValidationRules } from '@/validation/types/rules';

interface FormData {
  name: string;
  email: string;
}

// Define validation rules
const rules: ValidationRules = {
  name: {
    required: 'Name is required',
    min: { value: 2, message: 'Name must be at least 2 characters' }
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }
};

// Configure steps
const steps = [
  {
    id: 'personal',
    label: 'Personal Info',
    fields: ['name', 'email'],
    validation: createValidator(rules),
    render: ({ data, onChange, isValid }) => (
      <form>
        <input
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          aria-invalid={!isValid}
        />
        <input
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          aria-invalid={!isValid}
        />
      </form>
    )
  }
];

function MyForm() {
  return (
    <WizardProvider
      steps={steps}
      onSubmit={async (data) => {
        // Handle form submission
      }}
    >
      <Wizard />
    </WizardProvider>
  );
}
```

### Step Configuration

Each step requires:

- `id`: Unique identifier
- `label`: Step label
- `fields`: Array of data fields used in the step
- `render`: Component to render
- `validation`: Validation rules or function

### Validation

Validation is now centralized using the validation module:

```tsx
import { createValidator, ValidationRules } from '@/validation';

// Define validation rules
const rules: ValidationRules = {
  name: {
    required: 'Name is required',
    min: { value: 2, message: 'Name must be at least 2 characters' }
  }
};

// Create validator
const validator = createValidator(rules);

// Use in step configuration
const steps = [{
  id: 'step1',
  validation: validator,
  // ...
}];
```

### State Management

The wizard uses a composable state management pattern:

```tsx
import { useWizardState, useValidation } from '@/hooks';

function useCustomWizard<T>() {
  // Base wizard state
  const wizard = useWizardState<T>();
  
  // Add validation
  const validation = useValidation(wizard.data);
  
  // Extend with custom logic
  const customAction = () => {
    wizard.setData(...);
  };

  return {
    ...wizard,
    ...validation,
    customAction
  };
}
```

### Navigation

The wizard provides navigation components and hooks:

1. `WizardNavigation`: Step progress and navigation
```tsx
<WizardNavigation
  steps={steps}
  currentStep={currentStep}
  onStepClick={handleStepClick}
  isStepValid={(step) => step.validation(data)}
/>
```

2. `WizardControls`: Action buttons with validation
```tsx
<WizardControls
  canGoBack={currentStep > 0}
  canGoForward={isStepValid}
  canSubmit={isFormValid}
  isSubmitting={isSubmitting}
  onBack={prev}
  onNext={next}
  onSubmit={submit}
  onCancel={handleCancel}
/>
```

3. `useWizard` hook for custom navigation:
```tsx
function CustomControls() {
  const {
    next,
    prev,
    submit,
    isStepValid,
    isFormValid,
    currentStep
  } = useWizard();

  return (
    <div>
      <button
        onClick={prev}
        disabled={currentStep === 0}
      >
        Back
      </button>
      <button
        onClick={next}
        disabled={!isStepValid}
      >
        Next
      </button>
      <button
        onClick={submit}
        disabled={!isFormValid}
      >
        Submit
      </button>
    </div>
  );
}
```

### Error Handling

Errors are managed through a centralized error handling system:

```tsx
import { ErrorBoundary, useErrorHandler } from '@/error';

function WizardWithErrorHandling() {
  const handleError = useErrorHandler();

  return (
    <ErrorBoundary
      fallback={ErrorFallback}
      onError={handleError}
    >
      <WizardProvider
        onError={(error) => {
          // Log error
          debug.error('Form error:', error);
          
          // Handle specific errors
          if (error.code === 'VALIDATION') {
            handleValidationError(error);
          }
          
          // Show user feedback
          showErrorNotification(error.message);
        }}
      >
        <Wizard />
      </WizardProvider>
    </ErrorBoundary>
  );
}

## Best Practices

1. **Type Safety**
   - Define interfaces for form data and validation rules
   - Use TypeScript for better type inference
   - Validate data shape at runtime
   - Use type guards for runtime checks

2. **Validation**
   - Use centralized validation rules
   - Compose validators for complex validation
   - Handle async validation with proper loading states
   - Provide clear validation feedback

3. **State Management**
   - Use composable state hooks
   - Keep validation state separate
   - Manage loading states properly
   - Handle side effects cleanly

4. **Error Handling**
   - Use centralized error handling
   - Provide clear error messages
   - Log errors with proper context
   - Handle edge cases gracefully

5. **Performance**
   - Memoize expensive computations
   - Debounce validation calls
   - Lazy load heavy components
   - Monitor render cycles

## Extension Patterns

1. **Custom Validation**
```tsx
function useCustomValidation(rules: ValidationRules) {
  return {
    validate: async (data: unknown) => {
      // Custom validation logic
      return isValid;
    }
  };
}
```

2. **State Extensions**
```tsx
function useWizardWithHistory() {
  const wizard = useWizardState();
  const [history, setHistory] = useState([]);

  return {
    ...wizard,
    undo: () => {/* ... */},
    redo: () => {/* ... */}
  };
}
```

3. **Custom Steps**
```tsx
function createCustomStep<T>(config: StepConfig<T>) {
  return {
    ...config,
    beforeEnter: async () => {/* ... */},
    beforeLeave: async () => {/* ... */}
  };
}
```

## Examples

See the `examples` directory for detailed examples:

- `SimpleForm.tsx`: Basic form with validation
- `ComplexForm.tsx`: Multi-step form with custom validation
- `AsyncForm.tsx`: Form with API integration
- `CustomWizard.tsx`: Extended wizard with custom behavior

## Contributing

1. Follow existing patterns
2. Keep changes focused and minimal
3. Update documentation
4. Follow DRY principles
5. Use the debug utility for logging