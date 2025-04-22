import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WizardNavigation } from '../../WizardNavigation';
import { WizardControls } from '../../WizardControls';

describe('Wizard Flow Integration', () => {
  const mockSteps = [
    { id: '1', label: 'Step 1', isValid: true, isDirty: true },
    { id: '2', label: 'Step 2', isValid: false, isDirty: true },
    { id: '3', label: 'Step 3', isValid: false, isDirty: false },
  ];

  const WizardTest: React.FC = () => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [steps, setSteps] = React.useState(mockSteps);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleStepClick = (stepIndex: number) => {
      setCurrentStep(stepIndex);
    };

    const handleNext = () => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
      setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitting(false);
    };

    const canSubmit = currentStep === steps.length - 1 && steps.every(s => s.isValid);

    return (
      <div>
        <WizardNavigation
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
        <WizardControls
          canGoBack={currentStep > 0}
          canGoForward={currentStep < steps.length - 1}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
          onCancel={() => {}}
        />
      </div>
    );
  };

  it('completes a full wizard flow', async () => {
    render(<WizardTest />);

    // Initial state
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();

    // Navigate forward
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Step 2');

    // Navigate back
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Step 1');

    // Direct navigation
    fireEvent.click(screen.getByText('Step 2'));
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Step 2');

    // Cannot navigate to invalid step
    fireEvent.click(screen.getByText('Step 3'));
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Step 2');
  });

  it('handles keyboard navigation', () => {
    render(<WizardTest />);

    // Focus first button
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();

    // Tab through buttons
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    expect(document.activeElement).toBe(buttons[1]);

    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    expect(document.activeElement).toBe(buttons[2]);
  });

  it('maintains accessibility throughout flow', async () => {
    const { container } = render(<WizardTest />);

    // Check initial accessibility
    expect(await axe(container)).toHaveNoViolations();

    // Navigate and check accessibility
    fireEvent.click(screen.getByText('Next'));
    expect(await axe(container)).toHaveNoViolations();

    fireEvent.click(screen.getByText('Back'));
    expect(await axe(container)).toHaveNoViolations();
  });
});