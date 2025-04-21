import { useState } from 'react';
import { Button, Group, Modal, Stepper, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';
import { useCreateProject } from '../../hooks/useCreateProject';
import { IntegrationProvider } from '../../types';
import { handleApiError } from '../../core/errors';
import { STEPS, VALIDATION_RULES, FormValues } from './project-creation/config';
import { ProviderStep, NameStep, FolderStep, ReviewStep } from './project-creation/steps';
import { showSuccessNotification } from './project-creation/errors';

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
  const [activeStep, setActiveStep] = useState(0);
  const { createProject, isLoading } = useCreateProject(tenantId);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      cloudProvider: availableProviders[0],
      folderPath: ''
    },
    validate: {
      name: (value, values) => STEPS.find(s => s.field === 'name')?.validateStep?.(values) || null,
      cloudProvider: (value, values) => STEPS.find(s => s.field === 'cloudProvider')?.validateStep?.(values) || null,
      folderPath: (value, values) => STEPS.find(s => s.field === 'folderPath')?.validateStep?.(values) || null
    }
  });

  const handleSubmit = form.onSubmit(async (values) => {
    // Final validation before submission
    const finalValidation = STEPS[STEPS.length - 1].validateStep?.(values);
    if (finalValidation) {
      showValidationError(finalValidation);
      return;
    }

    try {
      await createProject({
        name: values.name,
        description: `Project using ${values.cloudProvider} at ${values.folderPath}`,
        provider: values.cloudProvider,
        folderPath: values.folderPath
      });

      showSuccessNotification();
      handleClose();
    } catch (error) {
      if (error.status === 403) {
        showRoleError();
        return;
      }
      handleApiError(error, 'Failed to create project');
    }
  });

  const handleClose = () => {
    setOpened(false);
    setActiveStep(0);
    form.reset();
  };

  const nextStep = () => {
    const currentStep = STEPS[activeStep];
    
    // Validate all fields for current step
    const stepError = currentStep.validateStep?.(form.values);
    if (stepError) {
      form.setFieldError(currentStep.field, stepError);
      showValidationError(stepError);
      return;
    }

    // Validate required fields
    const fieldErrors = currentStep.requiredFields.reduce((errors, field) => {
      const error = form.validateField(field);
      if (error) errors[field] = error;
      return errors;
    }, {} as Record<string, string>);

    if (Object.keys(fieldErrors).length > 0) {
      Object.entries(fieldErrors).forEach(([field, error]) => {
        form.setFieldError(field, error);
      });
      showValidationError('Please fix the validation errors before continuing.');
      return;
    }

    // Clear any previous errors for the step's fields
    currentStep.requiredFields.forEach(field => {
      form.clearFieldError(field);
    });

    setActiveStep((current) => current + 1);
  };

  const prevStep = () => setActiveStep((current) => current - 1);

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
        onClose={handleClose}
        title="Create New Project"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Stepper active={activeStep} onStepClick={setActiveStep}>
            {STEPS.map((step, index) => (
              <Stepper.Step
                key={index}
                label={step.label}
                description={step.description}
                icon={<step.icon size="1.2rem" />}
              >
                {activeStep === index && renderStep()}
              </Stepper.Step>
            ))}
          </Stepper>

          <Group justify="flex-end" mt="xl">
            {activeStep > 0 && (
              <Button variant="default" onClick={prevStep}>
                Back
              </Button>
            )}
            {activeStep === STEPS.length - 1 ? (
              <Button
                type="submit"
                loading={isLoading}
                disabled={availableProviders.length === 0 || !form.isValid()}
              >
                Create Project
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={availableProviders.length === 0}>
                Next
              </Button>
            )}
          </Group>
        </form>
      </Modal>
    </>
  );
}