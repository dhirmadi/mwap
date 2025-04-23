import { useState, useEffect } from 'react';
import { Button, Modal, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { IntegrationProvider } from '../../types';
import { STEPS } from './project-creation/config';
import { WizardNavigation } from '../wizard/WizardNavigation';
import { WizardControls } from '../wizard/WizardControls';
import { useProjectWizard } from '../../hooks/useProjectWizard';
import { FormErrorBoundary } from './project-creation/FormErrorBoundary';

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
      handleReset,
      goToStep
    },
    isLoading
  } = useProjectWizard({
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

  // Get current step component
  const CurrentStep = STEPS[activeStep]?.render;

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
        <FormErrorBoundary onReset={handleReset}>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}>
            <WizardNavigation
              steps={STEPS}
              currentStep={activeStep}
              onStepClick={goToStep}
              validatedSteps={validatedSteps}
              canNavigateToStep={canNavigateToStep}
            />

            {CurrentStep && (
              <CurrentStep
                data={form.values}
                onChange={form.setFieldValue}
                error={form.errors[STEPS[activeStep].id]}
                isLoading={isLoading}
                props={{ tenantId, availableProviders }}
              />
            )}

            <WizardControls
              canGoBack={activeStep > 0}
              canGoForward={activeStep < STEPS.length - 1 && !state.validating}
              canSubmit={activeStep === STEPS.length - 1 && form.isValid()}
              isSubmitting={isLoading || state === 'submitting'}
              onBack={handlePrev}
              onNext={handleNext}
              onSubmit={handleSubmit}
              onCancel={() => setOpened(false)}
              disabled={availableProviders.length === 0}
            />
          </form>
        </FormErrorBoundary>
      </Modal>
    </>
  );
}