import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WizardNavigation } from '../WizardNavigation';

describe('WizardNavigation', () => {
  const mockSteps = [
    { id: '1', label: 'Step 1', isValid: true, isDirty: true },
    { id: '2', label: 'Step 2', isValid: false, isDirty: true },
    { id: '3', label: 'Step 3', isValid: false, isDirty: false },
  ];

  const defaultProps = {
    steps: mockSteps,
    currentStep: 0,
    onStepClick: jest.fn(),
  };

  it('renders all steps', () => {
    render(<WizardNavigation {...defaultProps} />);
    
    mockSteps.forEach(step => {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    });
  });

  it('shows correct status for each step', () => {
    render(<WizardNavigation {...defaultProps} />);
    
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Invalid')).toBeInTheDocument();
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('marks current step as active', () => {
    render(<WizardNavigation {...defaultProps} />);
    
    const currentStep = screen.getByRole('tab', { selected: true });
    expect(currentStep).toHaveTextContent(mockSteps[0].label);
  });

  it('allows navigation to valid steps', () => {
    render(<WizardNavigation {...defaultProps} />);
    
    const step1 = screen.getByText('Step 1');
    fireEvent.click(step1);
    expect(defaultProps.onStepClick).toHaveBeenCalledWith(0);
  });

  it('prevents navigation to invalid steps', () => {
    render(<WizardNavigation {...defaultProps} />);
    
    const step3 = screen.getByText('Step 3');
    fireEvent.click(step3);
    expect(defaultProps.onStepClick).not.toHaveBeenCalled();
  });

  it('is accessible', () => {
    const { container } = render(<WizardNavigation {...defaultProps} />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Form steps')).toBeInTheDocument();
    expect(container).toBeAccessible();
  });
});