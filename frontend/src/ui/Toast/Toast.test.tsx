import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { ToastProvider } from './index';
import { useToast } from './useToast';

const TestComponent = () => {
  const { toast } = useToast();
  return (
    <button onClick={() => toast({ title: 'Success Message', type: 'success' })}>
      Show Toast
    </button>
  );
};

describe('Toast System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    act(() => {
      useToast.setState({ toasts: [] });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('useToast hook adds toast to store and renders in provider', () => {
    render(
      <>
        <ToastProvider />
        <TestComponent />
      </>
    );
    
    act(() => {
      screen.getByText('Show Toast').click();
    });
    
    expect(screen.getByText('Success Message')).toBeInTheDocument();
  });

  it('Has accessible role="alert" for error toasts, role="status" for info', () => {
    const ErrorTrigger = () => {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: 'Error Alert', type: 'error' })}>Error</button>;
    };

    const InfoTrigger = () => {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: 'Info Status', type: 'info' })}>Info</button>;
    };

    render(
      <>
        <ToastProvider />
        <ErrorTrigger />
        <InfoTrigger />
      </>
    );

    act(() => {
      screen.getByText('Error').click();
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      screen.getByText('Info').click();
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('Toast can be manually dismissed', () => {
    render(
      <>
        <ToastProvider />
        <TestComponent />
      </>
    );

    act(() => {
      screen.getByText('Show Toast').click();
    });
    expect(screen.getByText('Success Message')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Dismiss toast');
    act(() => {
      closeBtn.click();
    });

    expect(screen.queryByText('Success Message')).not.toBeInTheDocument();
  });
});
