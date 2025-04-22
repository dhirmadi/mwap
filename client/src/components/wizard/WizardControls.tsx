import React from 'react';
import { Group, Button } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';

export interface WizardControlsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const WizardControls: React.FC<WizardControlsProps> = ({
  canGoBack,
  canGoForward,
  canSubmit,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  onCancel,
}) => {
  return (
    <Group position="apart" mt="xl" role="group" aria-label="Form navigation">
      <Group>
        <Button
          variant="default"
          onClick={onCancel}
          leftIcon={<IconX size={18} />}
          aria-label="Cancel form"
        >
          Cancel
        </Button>
      </Group>
      <Group>
        <Button
          variant="default"
          onClick={onBack}
          disabled={!canGoBack}
          leftIcon={<IconArrowLeft size={18} />}
          aria-label="Previous step"
        >
          Back
        </Button>
        {canSubmit ? (
          <Button
            onClick={onSubmit}
            loading={isSubmitting}
            leftIcon={<IconCheck size={18} />}
            aria-label="Submit form"
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canGoForward}
            rightIcon={<IconArrowRight size={18} />}
            aria-label="Next step"
          >
            Next
          </Button>
        )}
      </Group>
    </Group>
  );
};

export default WizardControls;