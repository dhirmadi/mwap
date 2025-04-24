/**
 * @fileoverview Tests for useWizardState hook
 * @module hooks/__tests__/useWizardState.test
 */

import { renderHook, act } from '@testing-library/react';
import { useWizardState } from '../useWizardState';
import { WizardStepConfig } from '../../components/wizard/types';

interface TestData {
  name: string;
  value: string;
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
    fields: ['value'],
    render: () => null
  }
];

describe('useWizardState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useWizardState<TestData>(mockSteps));

    expect(result.current.state).toEqual({
      currentStep: 0,
      data: {} as TestData,
      isValid: false
    });
  });

  it('updates step correctly', () => {
    const { result } = renderHook(() => useWizardState<TestData>(mockSteps));

    act(() => {
      result.current.setStep(1);
    });

    expect(result.current.state.currentStep).toBe(1);
  });

  it('updates data correctly', () => {
    const { result } = renderHook(() => useWizardState<TestData>(mockSteps));

    act(() => {
      result.current.setData({ name: 'test' });
    });

    expect(result.current.state.data).toEqual({ name: 'test' });
  });

  it('updates validation state correctly', () => {
    const { result } = renderHook(() => useWizardState<TestData>(mockSteps));

    act(() => {
      result.current.setValid(true);
    });

    expect(result.current.state.isValid).toBe(true);
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useWizardState<TestData>(mockSteps));

    act(() => {
      result.current.setData({ name: 'test' });
      result.current.setStep(1);
      result.current.setValid(true);
      result.current.reset();
    });

    expect(result.current.state).toEqual({
      currentStep: 0,
      data: {} as TestData,
      isValid: false
    });
  });

  it('handles canGoNext correctly', () => {
    const { result } = renderHook(() => useWizardState<TestData>(mockSteps));

    // Cannot go next initially (invalid)
    expect(result.current.canGoNext()).toBe(false);

    // Can go next when valid and not last step
    act(() => {
      result.current.setValid(true);
    });
    expect(result.current.canGoNext()).toBe(true);

    // Cannot go next on last step
    act(() => {
      result.current.setStep(1);
    });
    expect(result.current.canGoNext()).toBe(false);
  });

  it('handles canGoPrev correctly', () => {
    const { result } = renderHook(() => useWizardState<TestData>(mockSteps));

    // Cannot go prev initially
    expect(result.current.canGoPrev()).toBe(false);

    // Can go prev after moving to next step
    act(() => {
      result.current.setStep(1);
    });
    expect(result.current.canGoPrev()).toBe(true);
  });
});