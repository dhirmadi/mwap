import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { WizardNavigation } from '../WizardNavigation';
import { WizardControls } from '../WizardControls';

describe('Wizard Components Accessibility', () => {
  describe('WizardNavigation', () => {
    const mockSteps = [
      { id: '1', label: 'Step 1', isValid: true, isDirty: true },
      { id: '2', label: 'Step 2', isValid: false, isDirty: true },
      { id: '3', label: 'Step 3', isValid: false, isDirty: false },
    ];

    it('has no accessibility violations', async () => {
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
      
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Form steps');
      expect(screen.getByRole('tab', { selected: true })).toHaveAttribute('aria-current', 'step');
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
      onCancel: () => {},
    };

    it('has no accessibility violations', async () => {
      const { container } = render(<WizardControls {...defaultProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has correct ARIA attributes', () => {
      render(<WizardControls {...defaultProps} />);
      
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Form navigation');
      expect(screen.getByLabelText('Previous step')).toBeInTheDocument();
      expect(screen.getByLabelText('Next step')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel form')).toBeInTheDocument();
    });

    it('maintains focus order', () => {
      render(<WizardControls {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('aria-label', 'Cancel form');
      expect(buttons[1]).toHaveAttribute('aria-label', 'Previous step');
      expect(buttons[2]).toHaveAttribute('aria-label', 'Next step');
    });
  });
});