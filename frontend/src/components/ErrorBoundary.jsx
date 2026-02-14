import { Component } from 'react';

/**
 * React Error Boundary — catches JavaScript errors in child component tree,
 * logs them, and displays a fallback UI instead of crashing the whole app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
