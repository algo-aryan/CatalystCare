'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CatalystCare ErrorBoundary]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-3xl m-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-900">Something went wrong</h2>
          <p className="text-sm text-red-700 mt-1">
            Please reload the page or contact your caregiver for assistance.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-6 py-2 bg-red-600 text-white font-bold rounded-xl"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
