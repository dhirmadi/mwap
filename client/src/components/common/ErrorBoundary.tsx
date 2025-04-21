/**
 * @fileoverview Error boundary component for handling React component errors
 * @module components/common/ErrorBoundary
 */

import React from 'react';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { handleApiError } from '../../core/errors';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  error: Error | null;
  hasError: boolean;
}

/**
 * Error boundary component that catches React errors and displays a fallback UI
 * @component
 * 
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<div>Something went wrong</div>}
 *   onError={(error) => console.error(error)}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Handle API errors
    if (error.name === 'ApiError') {
      handleApiError(error);
    }

    // Call error handler if provided
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Alert
          icon={<IconAlertCircle size="1.1rem" />}
          title="An error occurred"
          color="red"
          variant="filled"
        >
          <Stack spacing="sm">
            <Text size="sm">
              {this.state.error?.message || 'Something went wrong'}
            </Text>
            <Button
              variant="white"
              color="red"
              size="xs"
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}