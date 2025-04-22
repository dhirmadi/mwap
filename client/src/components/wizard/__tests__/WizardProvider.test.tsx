import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WizardProvider, useWizard } from '../WizardProvider';
import { WizardStepConfig } from '../types';

interface TestData {
  name: string;
  email: string;
}

const mockSteps: WizardStepConfig<TestData>[] = [
  {
    id: 'step1',
    label: 'Step 1',
    fields: ['name'],
    render: ({ data, onChange }) => (
      <input
        type="text"
        value={data.name || ''}
        onChange={(e) => onChange('name', e.target.value)}
        data-testid="name-input"
      />
    )
  },
  {
    id: 'step2',
    label: 'Step 2',
    fields: ['email'],
    validation: async (data) => {
      return data.email?.includes('@') || false;
    },
    render: ({ data, onChange }) => (
      <input
        type="email"
        value={data.email || ''}
        onChange={(e) => onChange('email', e.target.value)}
        data-testid="email-input"
      />
    )
  }
];

function TestComponent() {
  const { data, currentStep, next, prev, setData } = useWizard<TestData>();
  return (
    <div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="current-data">{JSON.stringify(data)}</div>
      <button onClick={() => prev()} data-testid="prev-button">
        Previous
      </button>
      <button onClick={() => next()} data-testid="next-button">
        Next
      </button>
      {mockSteps[currentStep].render({
        data,
        onChange: setData,
        onValidate: async () => true,
        isValid: true,
        isDirty: false,
        isLoading: false
      })}
    </div>
  );
}

describe('WizardProvider', () => {
  const mockSubmit = jest.fn();
  const mockError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children and provides context', () => {
    render(
      <WizardProvider
        steps={mockSteps}
        onSubmit={mockSubmit}
        onError={mockError}
      >
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
  });

  it('handles navigation correctly', async () => {
    render(
      <WizardProvider
        steps={mockSteps}
        onSubmit={mockSubmit}
        onError={mockError}
      >
        <TestComponent />
      </WizardProvider>
    );

    // Initial state
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');

    // Go to next step
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
    });

    // Go back
    fireEvent.click(screen.getByTestId('prev-button'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
  });

  it('updates data correctly', async () => {
    render(
      <WizardProvider
        steps={mockSteps}
        onSubmit={mockSubmit}
        onError={mockError}
      >
        <TestComponent />
      </WizardProvider>
    );

    // Update name
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'John' }
    });

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('current-data').textContent || '{}');
      expect(data.name).toBe('John');
    });

    // Go to next step
    fireEvent.click(screen.getByTestId('next-button'));

    // Update email
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'john@example.com' }
    });

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('current-data').textContent || '{}');
      expect(data.email).toBe('john@example.com');
    });
  });

  it('validates steps correctly', async () => {
    render(
      <WizardProvider
        steps={mockSteps}
        onSubmit={mockSubmit}
        onError={mockError}
      >
        <TestComponent />
      </WizardProvider>
    );

    // Go to email step
    fireEvent.click(screen.getByTestId('next-button'));

    // Try to submit with invalid email
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'invalid' }
    });
    fireEvent.click(screen.getByTestId('next-button'));

    // Should stay on same step
    expect(screen.getByTestId('current-step')).toHaveTextContent('1');

    // Fix email and try again
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'valid@example.com' }
    });
    fireEvent.click(screen.getByTestId('next-button'));

    // Should move to next step
    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('current-data').textContent || '{}');
      expect(data.email).toBe('valid@example.com');
    });
  });
});