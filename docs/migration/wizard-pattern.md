# Wizard Pattern Migration Guide

This guide outlines the process of migrating from the old form implementation to the new wizard pattern.

## Overview

The new wizard pattern provides:
- Better type safety
- Improved validation
- Centralized state management
- Enhanced accessibility
- Consistent navigation

## Breaking Changes

1. Component Structure
   - Old: Single form component
   - New: Separate navigation and control components

2. State Management
   - Old: Local component state
   - New: Centralized wizard context

3. Validation
   - Old: Per-field validation
   - New: Per-step validation with async support

4. Navigation
   - Old: Manual step handling
   - New: Built-in navigation controls

## Migration Steps

### 1. Update Dependencies

No new dependencies required. The wizard components use existing Mantine UI components.

### 2. Component Changes

Replace:
```tsx
<Form>
  <StepIndicator />
  <FormContent />
  <FormButtons />
</Form>
```

With:
```tsx
<WizardProvider>
  <WizardNavigation />
  <StepContent />
  <WizardControls />
</WizardProvider>
```

### 3. State Management

Replace local state:
```tsx
const [currentStep, setCurrentStep] = useState(0);
const [formData, setFormData] = useState({});
```

With wizard context:
```tsx
const { currentStep, formData, setField } = useWizard();
```

### 4. Validation

Replace field validation:
```tsx
const validateField = (name, value) => {
  // Field validation
};
```

With step validation:
```tsx
const validateStep = async (data) => {
  // Step validation
  return isValid;
};
```

### 5. Navigation

Replace manual navigation:
```tsx
<button onClick={() => setCurrentStep(prev => prev + 1)}>
  Next
</button>
```

With wizard controls:
```tsx
<WizardControls
  onNext={handleNext}
  onBack={handleBack}
  onSubmit={handleSubmit}
/>
```

## API Changes

### Old API

```tsx
interface FormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}
```

### New API

```tsx
interface WizardProps {
  steps: WizardStep[];
  onSubmit: (data: T) => Promise<void>;
  onError?: (error: Error) => void;
}
```

## State Flow Changes

1. Form Data
   - Old: Component state
   - New: Wizard context

2. Validation State
   - Old: Per-field
   - New: Per-step

3. Navigation State
   - Old: Manual tracking
   - New: Built-in management

## Best Practices

1. Step Organization
   - Group related fields
   - Keep steps focused
   - Validate appropriately

2. State Management
   - Use wizard context
   - Avoid prop drilling
   - Keep UI state local

3. Error Handling
   - Handle async errors
   - Show clear messages
   - Log appropriately

## Common Issues

1. State Management
   - Issue: Lost state between steps
   - Solution: Use wizard context

2. Validation
   - Issue: Validation timing
   - Solution: Use async validation

3. Navigation
   - Issue: Step access control
   - Solution: Use step guards

## Testing Changes

1. Unit Tests
   - Test individual steps
   - Validate state changes
   - Check accessibility

2. Integration Tests
   - Test full form flow
   - Validate data persistence
   - Check error handling

## Timeline

Estimated migration time: 2-3 days per form

1. Day 1: Setup and basic migration
2. Day 2: Validation and state management
3. Day 3: Testing and cleanup