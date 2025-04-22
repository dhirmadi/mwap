import { render, screen } from '@testing-library/react';
import { BaseStep, createWizardStep } from '../WizardStep';

describe('BaseStep', () => {
  it('renders children', () => {
    render(
      <BaseStep>
        <div data-testid="test-content">Test Content</div>
      </BaseStep>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('shows loading overlay when loading', () => {
    render(
      <BaseStep isLoading>
        <div>Content</div>
      </BaseStep>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

describe('createWizardStep', () => {
  const mockConfig = {
    label: 'Test Step',
    fields: ['test'] as const,
    render: ({ data, onChange }: any) => (
      <input
        type="text"
        value={data.test || ''}
        onChange={(e) => onChange('test', e.target.value)}
        data-testid="test-input"
      />
    )
  };

  it('creates a step component with base functionality', () => {
    const TestStep = createWizardStep(mockConfig);

    render(
      <TestStep
        data={{ test: 'value' }}
        onChange={() => {}}
        onValidate={async () => true}
        isValid={true}
        isDirty={false}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('test-input')).toHaveValue('value');
  });

  it('shows loading state', () => {
    const TestStep = createWizardStep(mockConfig);

    render(
      <TestStep
        data={{ test: '' }}
        onChange={() => {}}
        onValidate={async () => true}
        isValid={true}
        isDirty={false}
        isLoading={true}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});