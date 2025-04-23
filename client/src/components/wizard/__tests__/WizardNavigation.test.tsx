import { render, screen, fireEvent } from '@testing-library/react';
import { WizardNavigation } from '../WizardNavigation';

describe('WizardNavigation', () => {
  const mockSteps = [
    { id: '1', label: 'Step 1', isValid: true, isDirty: true },
    { id: '2', label: 'Step 2', isValid: false, isDirty: true },
    { id: '3', label: 'Step 3', isValid: false, isDirty: false }
  ];

  const defaultProps = {
    steps: mockSteps,
    currentStep: 0,
    onStepClick: jest.fn()
  };

  it('renders all steps', () => {
    render(<WizardNavigation {...defaultProps} />);
    mockSteps.forEach(step => {
      expect(screen.getByLabelText(`Step ${step.id}: ${step.label}`)).toBeInTheDocument();
    });
  });

  it('marks current step as active', () => {
    render(<WizardNavigation {...defaultProps} />);
    const currentStep = screen.getByLabelText(`Step 1: ${mockSteps[0].label}`);
    expect(currentStep).toHaveAttribute('aria-current', 'step');
  });

  it('allows navigation to previous steps', () => {
    render(<WizardNavigation {...defaultProps} currentStep={2} />);
    fireEvent.click(screen.getByLabelText(`Step 1: ${mockSteps[0].label}`));
    expect(defaultProps.onStepClick).toHaveBeenCalledWith(0);
  });

  it('prevents navigation to future steps if current step is invalid', () => {
    render(<WizardNavigation {...defaultProps} currentStep={1} />);
    fireEvent.click(screen.getByLabelText(`Step 3: ${mockSteps[2].label}`));
    expect(defaultProps.onStepClick).not.toHaveBeenCalled();
  });

  it('shows error state for invalid dirty steps', () => {
    render(<WizardNavigation {...defaultProps} />);
    const step2 = screen.getByLabelText(`Step 2: ${mockSteps[1].label}`);
    expect(step2).toHaveAttribute('data-error', 'true');
  });
});