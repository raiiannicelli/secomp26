import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4 p-8 rounded-2xl bg-[#1e2329] border border-[#2b3139]">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
              SECOMP <span className="text-[#fcd535]">2026</span>
            </h1>
            <p className="text-sm text-[#929aa5]">
              Ocorreu uma oscilação de renderização. Clique abaixo para atualizar a aplicação.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-lg bg-[#fcd535] text-[#181a20] font-bold text-xs hover:bg-[#f0b90b] transition-all"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
