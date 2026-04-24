import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="bg-red-500 p-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-black">Something went wrong</h1>
              <p className="mt-2 text-red-100 opacity-90">We encountered an unexpected error.</p>
            </div>
            
            <div className="p-8 text-center">
              <div className="mb-8 rounded-xl bg-slate-50 p-4 text-left text-sm font-mono text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                <p className="font-bold text-red-500 dark:text-red-400">Error Details:</p>
                <p className="mt-1 break-words">{this.state.error?.message || 'Unknown error'}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] dark:shadow-none"
                >
                  <RefreshCcw className="h-5 w-5" />
                  Reload App
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 text-lg font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Home className="h-5 w-5" />
                  Back to Dashboard
                </button>
              </div>
              
              <p className="mt-6 text-xs text-slate-400">
                If the problem persists, please clear your browser cache or contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
