import { renderHook, act } from '@testing-library/react';
import { useWizardState } from '../hooks';
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
    render: () => null
  },
  {
    id: 'step2',
    label: 'Step 2',
    fields: ['email'],
    validation: async (data) => {
      return data.email?.includes('@') || false;
    },
    render: () => null
  }
];

describe('useWizardState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useWizardState(mockSteps));

    expect(result.current.currentStep).toBe(0);
    expect(result.current.data).toEqual({});
    expect(result.current.steps).toHaveLength(2);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it('initializes with provided data', () => {
    const initialData = { name: 'John', email: 'john@example.com' };
    const { result } = renderHook(() => useWizardState(mockSteps, initialData));

    expect(result.current.data).toEqual(initialData);
  });

  it('handles navigation', async () => {
    const { result } = renderHook(() => useWizardState(mockSteps));

    // Go to next step
    await act(async () => {
      await result.current.next();
    });
    expect(result.current.currentStep).toBe(1);

    // Go back
    act(() => {
      result.current.prev();
    });
    expect(result.current.currentStep).toBe(0);

    // Go to specific step
    act(() => {
      result.current.goToStep(1);
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('updates data', () => {
    const { result } = renderHook(() => useWizardState(mockSteps));

    act(() => {
      result.current.setData('name', 'John');
    });

    expect(result.current.data.name).toBe('John');
    expect(result.current.steps[0].isDirty).toBe(true);
  });

  it('handles validation', async () => {
    const { result } = renderHook(() => useWizardState(mockSteps));

    // Go to email step
    await act(async () => {
      await result.current.next();
    });

    // Try invalid email
    act(() => {
      result.current.setData('email', 'invalid');
    });

    await act(async () => {
      const isValid = await result.current.validate();
      expect(isValid).toBe(false);
    });

    // Try valid email
    act(() => {
      result.current.setData('email', 'valid@example.com');
    });

    await act(async () => {
      const isValid = await result.current.validate();
      expect(isValid).toBe(true);
    });
  });

  it('resets state', () => {
    const { result } = renderHook(() => useWizardState(mockSteps));

    // Make some changes
    act(() => {
      result.current.setData('name', 'John');
      result.current.next();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.currentStep).toBe(0);
    expect(result.current.data).toEqual({});
    expect(result.current.steps.every(s => !s.isDirty)).toBe(true);
  });
});