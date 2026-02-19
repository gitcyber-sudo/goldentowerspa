import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError } from '../lib/errorLogger';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Send to Supabase Edge Function via centralized logger
        await logError({
            message: error.message,
            stack: error.stack,
            component_stack: errorInfo.componentStack,
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-cream flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gold/20 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="font-serif text-2xl text-charcoal mb-2">Something went wrong</h1>
                        <p className="text-charcoal/60 mb-6 text-sm">
                            We encountered an unexpected error. Our team has been notified.
                        </p>

                        <div className="bg-charcoal/5 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32">
                            <code className="text-xs text-charcoal/80 font-mono break-all">
                                {this.state.error?.message}
                            </code>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 px-6 py-3 bg-gold text-white rounded-xl hover:bg-gold-dark transition-colors font-medium text-sm"
                            >
                                <RefreshCw size={16} />
                                Reload Page
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center gap-2 px-6 py-3 border border-gold/20 text-charcoal rounded-xl hover:bg-gold/5 transition-colors font-medium text-sm"
                            >
                                <Home size={16} />
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
