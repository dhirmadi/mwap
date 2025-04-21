import { useState, useEffect } from 'react';
import { Button, Group, Modal, Stepper, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { IntegrationProvider } from '../../types';
import { STEPS } from './project-creation/config';
import { ProviderStep, NameStep, FolderStep, ReviewStep } from './project-creation/steps';
import { showValidationError } from './project-creation/errors';
import { useProjectCreationForm } from '../../hooks/useProjectCreationForm';

interface CreateProjectFormProps {
  tenantId: string;
  availableProviders: IntegrationProvider[];
  trigger?: React.ReactNode;
}

/**
 * Project creation form component
 * Opens in a modal dialog with step-by-step form flow
 */
export function CreateProjectForm({
  tenantId,
  availableProviders,
  trigger
}: CreateProjectFormProps) {
  const [opened, setOpened] = useState(false);

  // Initialize form with state machine
  const {
    form,
    state: {
      state,
      activeStep,
      validatedSteps,
      canNavigateToStep,
      handleNext,
      handlePrev,
      handleSubmit,
      handleReset
    },
    isLoading
  } = useProjectCreationForm({
    tenantId,
    availableProviders,
    onSuccess: () => setOpened(false)
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      handleReset();
    }
  }, [opened, handleReset]);

  // Handle step navigation
  const handleStepClick = (step: number) => {
    if (canNavigateToStep(step)) {
      form.setFieldValue('activeStep', step);
    } else {
      showValidationError('Please complete the current step before proceeding');
    }
  };

  // Render current step
  const renderStep = () => {
    const stepProps = { form, tenantId, availableProviders };
    
    switch (activeStep) {
      case 0:
        return <ProviderStep {...stepProps} />;
      case 1:
        return <NameStep {...stepProps} />;
      case 2:
        return <FolderStep {...stepProps} />;
      case 3:
        return <ReviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      {trigger ? (
        <Box onClick={() => setOpened(true)} style={{ cursor: 'pointer' }}>
          {trigger}
        </Box>
      ) : (
        <Button
          leftSection={<IconPlus size="1rem" />}
          onClick={() => setOpened(true)}
        >
          Create New Project
        </Button>
      )}

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create New Project"
        size="lg"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}>
          <Stepper 
            active={activeStep} 
            onStepClick={handleStepClick}
          >
            {STEPS.map((step, index) => (
              <Stepper.Step
                key={index}
                label={step.label}
                description={step.description}
                icon={<step.icon size="1.2rem" />}
                allowStepSelect={canNavigateToStep(index)}
                completedIcon={validatedSteps.has(index) ? undefined : null}
              >
                {activeStep === index && renderStep()}
              </Stepper.Step>
            ))}
          </Stepper>

          <Group justify="flex-end" mt="xl">
            {activeStep > 0 && (
              <Button variant="default" onClick={handlePrev}>
                Back
              </Button>
            )}
            {activeStep === STEPS.length - 1 ? (
              <Button
                type="submit"
                loading={isLoading || state === 'submitting'}
                disabled={
                  availableProviders.length === 0 ||
                  !form.isValid() ||
                  state === 'submitting'
                }
              >
                Create Project
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  availableProviders.length === 0 ||
                  state === 'validating'
                }
              >
                Next
              </Button>
            )}
          </Group>
        </form>
      </Modal>
    </>
  );
}