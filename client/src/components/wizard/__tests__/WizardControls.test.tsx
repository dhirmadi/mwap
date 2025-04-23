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
    onCancel: jest.fn()
  };

  it('renders navigation buttons', () => {
    render(<WizardControls {...defaultProps} />);
    expect(screen.getByLabelText('Previous step')).toBeInTheDocument();
    expect(screen.getByLabelText('Next step')).toBeInTheDocument();
    expect(screen.getByLabelText('Cancel wizard')).toBeInTheDocument();
  });

  it('disables back button when canGoBack is false', () => {
    render(<WizardControls {...defaultProps} canGoBack={false} />);
    expect(screen.getByLabelText('Previous step')).toBeDisabled();
  });

  it('disables next button when canGoForward is false', () => {
    render(<WizardControls {...defaultProps} canGoForward={false} />);
    expect(screen.getByLabelText('Next step')).toBeDisabled();
  });

  it('shows submit button instead of next when canSubmit is true', () => {
    render(<WizardControls {...defaultProps} canSubmit={true} />);
    expect(screen.getByLabelText('Submit wizard')).toBeInTheDocument();
    expect(screen.queryByLabelText('Next step')).not.toBeInTheDocument();
  });

  it('shows loading state on submit button', () => {
    render(<WizardControls {...defaultProps} canSubmit={true} isSubmitting={true} />);
    expect(screen.getByLabelText('Submit wizard')).toHaveAttribute('data-loading', 'true');
  });

  it('calls appropriate handlers when buttons are clicked', () => {
    render(<WizardControls {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText('Previous step'));
    expect(defaultProps.onBack).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Next step'));
    expect(defaultProps.onNext).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Cancel wizard'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});