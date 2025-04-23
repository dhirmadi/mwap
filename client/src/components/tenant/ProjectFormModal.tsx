import { Modal } from '@mantine/core';
import { IntegrationProvider } from '../../types';
import { STEPS } from './project-creation/config';
import { WizardNavigation } from '../wizard/WizardNavigation';
import { WizardControls } from '../wizard/WizardControls';
import { useProjectWizard } from '../../hooks/useProjectWizard';
import { FormErrorBoundary } from './project-creation/FormErrorBoundary';

interface ProjectFormModalProps {
  opened: boolean;
  onClose: () => void;
  tenantId: string;
  availableProviders: IntegrationProvider[];
}

/**
 * Modal component containing the project creation form
 */
export function ProjectFormModal({
  opened,
  onClose,
  tenantId,
  availableProviders
}: ProjectFormModalProps) {
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
    onSuccess: onClose
  });

  // Get current step component
  const CurrentStep = STEPS[activeStep]?.render;

  return (
    <Modal
      opened={opened}
      onClose={() => {
        handleReset();
        onClose();
      }}
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
            onCancel={onClose}
            disabled={availableProviders.length === 0}
          />
        </form>
      </FormErrorBoundary>
    </Modal>
  );
}