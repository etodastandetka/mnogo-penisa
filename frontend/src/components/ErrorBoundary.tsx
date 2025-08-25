import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary поймал ошибку:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            padding: '1rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          <div 
            className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center"
            style={{
              maxWidth: '28rem',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            <div 
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <span style={{ fontSize: '2rem' }}>⚠️</span>
            </div>
            
            <h2 
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem'
              }}
            >
              Что-то пошло не так
            </h2>
            
            <p 
              className="text-gray-600 mb-6"
              style={{
                color: '#4b5563',
                marginBottom: '1.5rem',
                lineHeight: '1.5'
              }}
            >
              Произошла ошибка при загрузке страницы. Пожалуйста, попробуйте обновить страницу.
            </p>
            
            <div 
              className="space-y-3"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                style={{
                  width: '100%',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Обновить страницу
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                style={{
                  width: '100%',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Назад
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details 
                className="mt-4 text-left"
                style={{ marginTop: '1rem', textAlign: 'left' }}
              >
                <summary 
                  className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
                  style={{
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}
                >
                  Детали ошибки (только для разработчиков)
                </summary>
                <pre 
                  className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto"
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#dc2626',
                    backgroundColor: '#fef2f2',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    overflow: 'auto'
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
