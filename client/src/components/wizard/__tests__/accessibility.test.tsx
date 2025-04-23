import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WizardNavigation } from '../WizardNavigation';
import { WizardControls } from '../WizardControls';

expect.extend(toHaveNoViolations);

describe('Wizard Components Accessibility', () => {
  describe('WizardNavigation', () => {
    const mockSteps = [
      { id: '1', label: 'Step 1', isValid: true, isDirty: true },
      { id: '2', label: 'Step 2', isValid: false, isDirty: true }
    ];

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <WizardNavigation
          steps={mockSteps}
          currentStep={0}
          onStepClick={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has correct ARIA attributes', () => {
      render(
        <WizardNavigation
          steps={mockSteps}
          currentStep={0}
          onStepClick={() => {}}
        />
      );
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Step 1: Step 1')).toHaveAttribute('aria-current', 'step');
    });
  });

  describe('WizardControls', () => {
    const defaultProps = {
      canGoBack: true,
      canGoForward: true,
      canSubmit: false,
      isSubmitting: false,
      onBack: () => {},
      onNext: () => {},
      onSubmit: () => {},
      onCancel: () => {}
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(<WizardControls {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has correct ARIA attributes', () => {
      render(<WizardControls {...defaultProps} />);
      expect(screen.getByRole('group', { name: 'Wizard controls' })).toBeInTheDocument();
      expect(screen.getByLabelText('Previous step')).toBeInTheDocument();
      expect(screen.getByLabelText('Next step')).toBeInTheDocument();
    });

    it('maintains focus management', () => {
      render(<WizardControls {...defaultProps} canGoBack={false} />);
      const backButton = screen.getByLabelText('Previous step');
      expect(backButton).toBeDisabled();
      expect(backButton).toHaveAttribute('tabindex', '-1');
    });
  });
});