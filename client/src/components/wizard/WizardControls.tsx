/**
 * @fileoverview Control buttons for wizard navigation
 * @module components/wizard/WizardControls
 */

import { Button, Group } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { ICON_SIZES } from '../../core/theme/icons';

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

export function WizardControls({
  canGoBack,
  canGoForward,
  canSubmit,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  onCancel
}: WizardControlsProps) {
  return (
    <Group justify="space-between" mt="xl" role="group" aria-label="Wizard controls">
      <Group>
        <Button
          variant="default"
          onClick={onCancel}
          leftSection={<IconX size={ICON_SIZES.sm} />}
          aria-label="Cancel wizard"
        >
          Cancel
        </Button>
      </Group>
      <Group>
        <Button
          variant="default"
          onClick={onBack}
          disabled={!canGoBack}
          leftSection={<IconArrowLeft size={ICON_SIZES.sm} />}
          aria-label="Previous step"
        >
          Back
        </Button>
        {canSubmit ? (
          <Button
            onClick={onSubmit}
            loading={isSubmitting}
            leftSection={<IconDeviceFloppy size={ICON_SIZES.sm} />}
            aria-label="Submit wizard"
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canGoForward}
            rightSection={<IconArrowRight size={ICON_SIZES.sm} />}
            aria-label="Next step"
          >
            Next
          </Button>
        )}
      </Group>
    </Group>
  );
}