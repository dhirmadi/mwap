import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WizardControls } from '../WizardControls';

describe('WizardControls', () => {
  const defaultProps = {
    canGoBack: true,
    canGoForward: true,
    canSubmit: false,
    isSubmitting: false,
    onBack: jest.fn(),
    onNext: jest.fn(),
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  it('renders navigation buttons', () => {
    render(<WizardControls {...defaultProps} />);
    
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('disables back button when canGoBack is false', () => {
    render(<WizardControls {...defaultProps} canGoBack={false} />);
    
    expect(screen.getByText('Back')).toBeDisabled();
  });

  it('disables next button when canGoForward is false', () => {
    render(<WizardControls {...defaultProps} canGoForward={false} />);
    
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('shows submit button instead of next when canSubmit is true', () => {
    render(<WizardControls {...defaultProps} canSubmit={true} />);
    
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('shows loading state on submit button', () => {
    render(<WizardControls {...defaultProps} canSubmit={true} isSubmitting={true} />);
    
    const submitButton = screen.getByText('Submit');
    expect(submitButton).toHaveAttribute('data-loading', 'true');
  });

  it('calls appropriate handlers when buttons are clicked', () => {
    render(<WizardControls {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Back'));
    expect(defaultProps.onBack).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Next'));
    expect(defaultProps.onNext).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('is accessible', () => {
    const { container } = render(<WizardControls {...defaultProps} />);
    
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByLabelText('Form navigation')).toBeInTheDocument();
    expect(container).toBeAccessible();
  });
});