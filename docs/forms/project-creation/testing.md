# Testing Guidelines

## Overview

This document outlines testing strategies and guidelines for the project creation form components and hooks.

## Test Types

### Unit Tests

Test individual components and hooks in isolation:

```typescript
// Testing form hooks
describe('useFormStateMachine', () => {
  it('should handle state transitions correctly', () => {
    const { result } = renderHook(() => useFormStateMachine({
      form,
      config: {
        steps: [],
        onSubmit: jest.fn()
      }
    }));

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.state).toBe('validating');
  });
});

// Testing components
describe('BaseStep', () => {
  it('should render children and handle errors', () => {
    const onError = jest.fn();
    const { getByText } = render(
      <BaseStep onError={onError}>
        <div>Step content</div>
      </BaseStep>
    );

    expect(getByText('Step content')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test component interactions and form flow:

```typescript
describe('CreateProjectForm', () => {
  it('should complete form flow successfully', async () => {
    const { getByLabelText, getByText } = render(<CreateProjectForm />);

    // Fill out provider step
    await userEvent.selectOptions(
      getByLabelText('Cloud Provider'),
      'aws'
    );
    await userEvent.click(getByText('Next'));

    // Fill out name step
    await userEvent.type(
      getByLabelText('Project Name'),
      'test-project'
    );
    await userEvent.click(getByText('Next'));

    // Verify form submission
    await userEvent.click(getByText('Submit'));
    expect(getByText('Project created successfully')).toBeInTheDocument();
  });
});
```

### Error Handling Tests

Test error scenarios and recovery:

```typescript
describe('FormErrorBoundary', () => {
  it('should catch and handle errors', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <FormErrorBoundary>
        <ErrorComponent />
      </FormErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeInTheDocument();
    expect(getByText('Try again')).toBeInTheDocument();
  });
});
```

### Validation Tests

Test form validation at different levels:

```typescript
describe('Form Validation', () => {
  it('should validate fields correctly', () => {
    const { result } = renderHook(() => useFieldValidation({
      name: [
        {
          validate: (value) => !value ? 'Required' : null
        }
      ]
    }));

    const error = result.current.validateField('name', '');
    expect(error).toEqual({
      field: 'name',
      message: 'Required'
    });
  });
});
```

## Test Setup

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Test Utilities

```typescript
// test-utils.ts
import { render } from '@testing-library/react';
import { FormProvider } from '@mantine/form';

export function renderWithForm(ui: React.ReactElement) {
  const form = useForm({
    initialValues: {}
  });

  return render(
    <FormProvider form={form}>
      {ui}
    </FormProvider>
  );
}
```

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use descriptive names
   - Follow AAA pattern

2. **Test Coverage**
   - Test happy path
   - Test error cases
   - Test edge cases

3. **Test Isolation**
   - Mock external dependencies
   - Reset state between tests
   - Clean up after tests

4. **Test Maintenance**
   - Keep tests focused
   - Avoid test duplication
   - Update tests with code

## Examples

### Testing Form State

```typescript
describe('Form State', () => {
  it('should track validated steps', () => {
    const { result } = renderHook(() => useFormStateMachine({
      form,
      config: {
        steps: [
          {
            validate: () => null,
            requiredFields: ['name']
          }
        ]
      }
    }));

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.validatedSteps.has(0)).toBe(true);
  });
});
```

### Testing Error Recovery

```typescript
describe('Error Recovery', () => {
  it('should recover from validation errors', async () => {
    const { getByText, getByLabelText } = render(<CreateProjectForm />);

    // Trigger validation error
    await userEvent.click(getByText('Next'));
    expect(getByText('Required field')).toBeInTheDocument();

    // Recover from error
    await userEvent.type(getByLabelText('Name'), 'test');
    await userEvent.click(getByText('Next'));
    expect(getByText('Required field')).not.toBeInTheDocument();
  });
});
```

### Testing Async Validation

```typescript
describe('Async Validation', () => {
  it('should handle async validation', async () => {
    const validateName = jest.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useFieldValidation({
      name: [
        {
          validate: validateName
        }
      ]
    }));

    await act(async () => {
      await result.current.validateField('name', 'test');
    });

    expect(validateName).toHaveBeenCalledWith('test');
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- FormState.test.ts
```