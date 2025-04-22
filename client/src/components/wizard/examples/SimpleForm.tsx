/**
 * @fileoverview Example implementation of wizard pattern
 * @module components/wizard/examples/SimpleForm
 */

import { TextInput, Button, Group } from '@mantine/core';
import { WizardProvider, useWizard } from '../WizardProvider';
import { WizardStepConfig } from '../types';
import { createWizardStep } from '../WizardStep';

interface FormData {
  name: string;
  email: string;
  message: string;
}

// Define steps
const steps: WizardStepConfig<FormData>[] = [
  {
    id: 'personal',
    label: 'Personal Info',
    fields: ['name', 'email'],
    validation: async (data) => {
      const errors: string[] = [];
      if (!data.name) errors.push('Name is required');
      if (!data.email?.includes('@')) errors.push('Invalid email');
      return errors.length === 0;
    },
    render: createWizardStep({
      label: 'Personal Info',
      fields: ['name', 'email'],
      render: ({ data, onChange, error }) => (
        <Group>
          <TextInput
            label="Name"
            value={data.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            error={error}
            required
          />
          <TextInput
            label="Email"
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            error={error}
            required
          />
        </Group>
      )
    })
  },
  {
    id: 'message',
    label: 'Message',
    fields: ['message'],
    validation: async (data) => {
      return data.message?.length > 0;
    },
    render: createWizardStep({
      label: 'Message',
      fields: ['message'],
      render: ({ data, onChange, error }) => (
        <TextInput
          label="Message"
          value={data.message || ''}
          onChange={(e) => onChange('message', e.target.value)}
          error={error}
          required
        />
      )
    })
  }
];

function FormControls() {
  const { currentStep, next, prev, submit, isSubmitting } = useWizard<FormData>();
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Group justify="flex-end" mt="xl">
      {currentStep > 0 && (
        <Button variant="default" onClick={prev}>
          Back
        </Button>
      )}
      <Button
        onClick={isLastStep ? submit : next}
        loading={isSubmitting}
      >
        {isLastStep ? 'Submit' : 'Next'}
      </Button>
    </Group>
  );
}

/**
 * Example form using wizard pattern
 */
export function SimpleForm() {
  const handleSubmit = async (data: FormData) => {
    console.log('Form submitted:', data);
  };

  const handleError = (error: Error) => {
    console.error('Form error:', error);
  };

  return (
    <WizardProvider
      steps={steps}
      onSubmit={handleSubmit}
      onError={handleError}
    >
      {steps[currentStep].render}
      <FormControls />
    </WizardProvider>
  );
}