import React, { ReactNode, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../constants';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Logging suppressed as per request
    setTimeout(() => {
        this.setState({ hasError: false });
    }, 5000);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4 text-center">
          <motion.div 
            {...({ initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 } } as any)}
            className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 backdrop-blur-xl"
          >
            <Icons.RotateCcw className="w-16 h-16 mx-auto mb-4 text-red-500 animate-spin" style={{ animationDuration: '3s' }} />
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">Attempting to restore the application...</p>
            <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-red-600 rounded-full font-bold hover:bg-red-700 transition-colors"
            >
                Reload Now
            </button>
          </motion.div>
        </div>
      );
    }
    return this.props.children;
  }
}