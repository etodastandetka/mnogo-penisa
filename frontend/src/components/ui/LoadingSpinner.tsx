import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div 
      className="min-h-screen bg-white flex items-center justify-center px-4"
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div className="text-center">
        <div className="relative">
          <div 
            className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto"
            style={{
              width: '4rem',
              height: '4rem',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #f97316',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}
          ></div>
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div 
              className="w-8 h-8 bg-orange-500 rounded-full animate-pulse"
              style={{
                width: '2rem',
                height: '2rem',
                backgroundColor: '#f97316',
                borderRadius: '50%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            ></div>
          </div>
        </div>
        <p 
          className="mt-6 text-gray-600 text-lg font-medium"
          style={{
            marginTop: '1.5rem',
            color: '#4b5563',
            fontSize: '1.125rem',
            fontWeight: '500'
          }}
        >
          Загружаем...
        </p>
        <p 
          className="mt-2 text-gray-400 text-sm"
          style={{
            marginTop: '0.5rem',
            color: '#9ca3af',
            fontSize: '0.875rem'
          }}
        >
          Пожалуйста, подождите
        </p>
      </div>
      

    </div>
  );
};

