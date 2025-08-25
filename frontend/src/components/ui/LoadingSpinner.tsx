import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-600 text-lg font-medium">Загружаем...</p>
        <p className="mt-2 text-gray-400 text-sm">Пожалуйста, подождите</p>
      </div>
    </div>
  );
};

