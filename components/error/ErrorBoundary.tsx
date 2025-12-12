'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex min-h-[400px] flex-col items-center justify-center px-4 py-8 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-light">
            <AlertTriangle className="h-8 w-8 text-error" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Something went wrong
          </h2>
          <p className="mb-6 max-w-md text-gray-600">
            {this.state.error?.message ||
              'An unexpected error occurred. Please try again.'}
          </p>
          <div className="flex gap-4">
            <Button onClick={this.handleReset}>Try Again</Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
            >
              Go Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

