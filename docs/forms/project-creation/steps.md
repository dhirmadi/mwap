# Form Step Components

## Overview

The form step components guide users through the project creation process. Each step is isolated and handles its own validation and error states.

## Base Step Component

```typescript
// BaseStep component
interface BaseStepProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

function BaseStep({ children, onError }: BaseStepProps) {
  return (
    <FormErrorBoundary onError={onError}>
      <Box p="md">
        {children}
      </Box>
    </FormErrorBoundary>
  );
}
```

## Step Components

### Provider Step

```typescript
function ProviderStep({ form }: StepProps) {
  return (
    <BaseStep>
      <Select
        label="Cloud Provider"
        data={PROVIDER_OPTIONS}
        {...form.getInputProps('cloudProvider')}
      />
    </BaseStep>
  );
}
```

### Name Step

```typescript
function NameStep({ form }: StepProps) {
  return (
    <BaseStep>
      <TextInput
        label="Project Name"
        {...form.getInputProps('name')}
      />
      <Textarea
        label="Description"
        {...form.getInputProps('description')}
      />
    </BaseStep>
  );
}
```

### Folder Step

```typescript
function FolderStep({ form }: StepProps) {
  return (
    <BaseStep>
      <TextInput
        label="Folder Path"
        {...form.getInputProps('folderPath')}
      />
    </BaseStep>
  );
}
```

## Step Configuration

```typescript
// Step configuration
const STEPS: Step[] = [
  {
    component: ProviderStep,
    validate: validateProviderStep,
    requiredFields: ['cloudProvider']
  },
  {
    component: NameStep,
    validate: validateNameStep,
    requiredFields: ['name']
  },
  {
    component: FolderStep,
    validate: validateFolderStep,
    requiredFields: ['folderPath']
  }
];
```

## Step Navigation

```typescript
function StepNavigation({ 
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  isValid
}: NavigationProps) {
  return (
    <Group position="apart">
      <Button
        onClick={onPrev}
        disabled={currentStep === 0}
      >
        Previous
      </Button>
      <Button
        onClick={onNext}
        disabled={!isValid}
      >
        {currentStep === totalSteps - 1 ? 'Submit' : 'Next'}
      </Button>
    </Group>
  );
}
```

## Step Progress

```typescript
function StepProgress({
  currentStep,
  totalSteps,
  validatedSteps
}: ProgressProps) {
  return (
    <Stepper
      active={currentStep}
      completedIcon={<IconCheck />}
    >
      {STEPS.map((step, index) => (
        <Stepper.Step
          key={index}
          completed={validatedSteps.has(index)}
        />
      ))}
    </Stepper>
  );
}
```

## Step Validation

```typescript
// Step validation configuration
const stepValidation = {
  provider: {
    validate: async (values) => {
      if (!values.cloudProvider) {
        return 'Please select a cloud provider';
      }
      try {
        await validateProvider(values.cloudProvider);
        return null;
      } catch (error) {
        return 'Invalid cloud provider';
      }
    },
    requiredFields: ['cloudProvider']
  },
  // ... other step validations
};
```

## Usage

```typescript
function CreateProjectForm() {
  const form = useForm({
    initialValues: {
      cloudProvider: '',
      name: '',
      description: '',
      folderPath: ''
    }
  });

  const {
    currentStep,
    validatedSteps,
    handleNext,
    handlePrev
  } = useFormStateMachine({
    form,
    config: {
      steps: STEPS,
      onSubmit: handleSubmit
    }
  });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <StepProgress
        currentStep={currentStep}
        totalSteps={STEPS.length}
        validatedSteps={validatedSteps}
      />
      
      {createElement(STEPS[currentStep].component, { form })}
      
      <StepNavigation
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onNext={handleNext}
        onPrev={handlePrev}
        isValid={form.isValid()}
      />
    </form>
  );
}
```

## Best Practices

1. **Step Design**
   - Keep steps focused
   - Handle validation
   - Show clear progress

2. **Navigation**
   - Clear indicators
   - Proper validation
   - Error feedback

3. **Validation**
   - Field validation
   - Step validation
   - Clear messages

4. **Error Handling**
   - Error boundaries
   - Recovery options
   - Clear feedback

## Examples

### Custom Step

```typescript
function CustomStep({ form }: StepProps) {
  const { validateField } = useFieldValidation(rules);

  return (
    <BaseStep>
      <TextInput
        label="Custom Field"
        {...form.getInputProps('customField')}
        onBlur={() => validateField(
          'customField',
          form.values.customField
        )}
      />
      {form.errors.customField && (
        <Text color="red">
          {form.errors.customField}
        </Text>
      )}
    </BaseStep>
  );
}
```

### Step with Async Validation

```typescript
function AsyncStep({ form }: StepProps) {
  const [loading, setLoading] = useState(false);
  
  const handleValidate = async () => {
    setLoading(true);
    try {
      await validateAsync(form.values);
      form.setFieldValue('validated', true);
    } catch (error) {
      form.setFieldError('async', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseStep>
      <Button
        loading={loading}
        onClick={handleValidate}
      >
        Validate
      </Button>
    </BaseStep>
  );
}
```

### Step with Dependencies

```typescript
function DependentStep({ form }: StepProps) {
  const provider = form.values.cloudProvider;
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (provider) {
      loadOptions(provider).then(setOptions);
    }
  }, [provider]);

  return (
    <BaseStep>
      <Select
        label="Option"
        data={options}
        disabled={!provider}
        {...form.getInputProps('option')}
      />
    </BaseStep>
  );
}
```