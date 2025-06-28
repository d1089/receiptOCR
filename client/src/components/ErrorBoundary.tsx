import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4 }}>
          <Alert severity="error" icon={<AlertTriangle />}>
            <AlertTitle>Something went wrong</AlertTitle>
            <Box sx={{ mb: 2 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Box>
            <Button
              variant="outlined"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;