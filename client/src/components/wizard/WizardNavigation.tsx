import React from 'react';
import { Box, Stepper, Group, Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export interface WizardNavigationProps {
  steps: {
    id: string;
    label: string;
    isValid: boolean;
    isDirty: boolean;
  }[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <Box role="navigation" aria-label="Form steps">
      <Stepper
        active={currentStep}
        onStepClick={onStepClick}
        breakpoint="sm"
      >
        {steps.map((step, index) => (
          <Stepper.Step
            key={step.id}
            label={step.label}
            description={getStepStatus(step)}
            icon={getStepIcon(step)}
            allowStepClick={canNavigateToStep(step, index, currentStep, steps)}
            aria-current={currentStep === index ? 'step' : undefined}
          />
        ))}
      </Stepper>
    </Box>
  );
};

const getStepStatus = (step: WizardNavigationProps['steps'][0]): React.ReactNode => {
  if (!step.isDirty) return <Text size="sm">Not started</Text>;
  if (step.isValid) return <Text size="sm" color="green">Complete</Text>;
  return <Text size="sm" color="red">Invalid</Text>;
};

const getStepIcon = (step: WizardNavigationProps['steps'][0]): React.ReactNode => {
  if (!step.isDirty) return undefined;
  if (step.isValid) return <IconCheck size={18} />;
  return <IconX size={18} />;
};

const canNavigateToStep = (
  step: WizardNavigationProps['steps'][0],
  stepIndex: number,
  currentStep: number,
  steps: WizardNavigationProps['steps']
): boolean => {
  // Can always navigate to current or previous steps
  if (stepIndex <= currentStep) return true;
  
  // Can only navigate forward if all previous steps are valid
  const previousSteps = steps.slice(0, stepIndex);
  return previousSteps.every(s => s.isValid);
};

export default WizardNavigation;