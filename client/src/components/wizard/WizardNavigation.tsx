/**
 * @fileoverview Navigation component for wizard steps
 * @module components/wizard/WizardNavigation
 */

import { Stepper } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { ICON_SIZES } from '../../core/theme/icons';
import { useCallback } from 'react';

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

export function WizardNavigation({ steps, currentStep, onStepClick }: WizardNavigationProps) {
  const getStepStatus = useCallback((step: { isValid: boolean; isDirty: boolean }, index: number) => {
    if (index > currentStep) return 'pending';
    if (step.isDirty && !step.isValid) return 'error';
    if (step.isValid) return 'completed';
    return 'progress';
  }, [currentStep]);

  const canNavigateToStep = useCallback((index: number) => {
    // Can always go back
    if (index < currentStep) return true;
    // Can't skip steps
    if (index > currentStep + 1) return false;
    // Can go to next step if current is valid
    if (index === currentStep + 1) return steps[currentStep]?.isValid ?? false;
    return true;
  }, [currentStep, steps]);

  return (
    <Stepper
      active={currentStep}
      onStepClick={(index) => {
        if (canNavigateToStep(index)) {
          onStepClick(index);
        }
      }}
      allowNextStepsSelect={false}
      aria-label="Wizard navigation"
      role="navigation"
    >
      {steps.map((step, index) => {
        const status = getStepStatus(step, index);
        return (
          <Stepper.Step
            key={step.id}
            label={step.label}
            completedIcon={status === 'error' ? <IconX size={ICON_SIZES.sm} /> : <IconCheck size={ICON_SIZES.sm} />}
            color={status === 'error' ? 'red' : undefined}
            aria-current={currentStep === index ? 'step' : undefined}
            allowStepClick={canNavigateToStep(index)}
            aria-label={`Step ${index + 1}: ${step.label}`}
          />
        );
      })}
    </Stepper>
  );
}