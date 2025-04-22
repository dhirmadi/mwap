# Wizard Pattern Implementation

A reusable wizard pattern implementation for multi-step forms with validation and state management.

## Features

- Type-safe step configuration
- Built-in validation
- State management
- Navigation controls
- Error handling
- Loading states
- DRY implementation

## Installation

The wizard components are built on top of Mantine UI and use React hooks. No additional dependencies are required.

## Usage

### Basic Example

```tsx
import { WizardProvider, createWizardStep } from './components/wizard';

interface FormData {
  name: string;
  email: string;
}

const steps = [
  {
    id: 'personal',
    label: 'Personal Info',
    fields: ['name', 'email'],
    validation: async (data) => {
      return data.name && data.email?.includes('@');
    },
    render: createWizardStep({
      label: 'Personal Info',
      fields: ['name', 'email'],
      render: ({ data, onChange }) => (
        <form>
          <input
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          <input
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </form>
      )
    })
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
      {/* Your form content */}
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
- `validation` (optional): Async validation function

### Validation

Validation is handled per step:

```tsx
const validation = async (data: FormData) => {
  const errors: string[] = [];
  if (!data.name) errors.push('Name is required');
  if (!data.email?.includes('@')) errors.push('Invalid email');
  return errors.length === 0;
};
```

### Navigation

Use the `useWizard` hook to access navigation functions:

```tsx
function FormControls() {
  const { next, prev, submit } = useWizard();
  return (
    <div>
      <button onClick={prev}>Back</button>
      <button onClick={next}>Next</button>
    </div>
  );
}
```

### Error Handling

Errors are managed through the wizard context:

```tsx
<WizardProvider
  onError={(error) => {
    console.error('Form error:', error);
  }}
>
  {/* ... */}
</WizardProvider>
```

## Best Practices

1. **Type Safety**
   - Define interfaces for form data
   - Use TypeScript for better type inference
   - Validate data shape at runtime

2. **Validation**
   - Validate each step independently
   - Use async validation for API calls
   - Handle validation errors gracefully

3. **State Management**
   - Keep form state in the wizard context
   - Use local state for UI-only state
   - Avoid prop drilling

4. **Error Handling**
   - Handle both validation and runtime errors
   - Show user-friendly error messages
   - Log errors for debugging

## Examples

See the `examples` directory for more detailed examples:

- `SimpleForm.tsx`: Basic form implementation
- `ComplexForm.tsx`: Advanced usage with custom validation
- `AsyncForm.tsx`: Form with API integration

## Testing

Run tests:

```bash
npm test
```

Test coverage:

```bash
npm run test:coverage
```

## Contributing

1. Follow existing patterns
2. Add tests for new features
3. Update documentation
4. Follow DRY principles