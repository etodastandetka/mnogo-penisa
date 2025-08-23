import React from 'react';
import { RefreshCw, Wifi, Trash2 } from 'lucide-react';

interface ErrorFixButtonProps {
  onFix: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ErrorFixButton: React.FC<ErrorFixButtonProps> = ({ 
  onFix, 
  isLoading = false, 
  error 
}) => {
  if (!error) return null;

  const handleFix = async () => {
    try {
      // Очищаем кэш localStorage
      localStorage.removeItem('products_cache');
      localStorage.removeItem('orders_cache');
      
      // Очищаем sessionStorage
      sessionStorage.clear();
      
      // Принудительно обновляем страницу
      window.location.reload();
      
      // Вызываем callback
      onFix();
    } catch (err) {
      console.error('Ошибка при исправлении:', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleFix}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-full shadow-lg
          bg-gradient-to-r from-orange-500 to-red-500
          hover:from-orange-600 hover:to-red-600
          text-white font-medium transition-all duration-200
          transform hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isLoading ? 'animate-pulse' : ''}
        `}
        title="Исправить ошибку загрузки"
      >
        {isLoading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <Wifi className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">
          {isLoading ? 'Исправляем...' : 'Исправить ошибку'}
        </span>
        <span className="sm:hidden">
          {isLoading ? '...' : 'Исправить'}
        </span>
      </button>
      
      {/* Дополнительная кнопка для очистки кэша */}
      <button
        onClick={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        }}
        className="
          mt-2 flex items-center gap-2 px-3 py-2 rounded-full
          bg-gray-600 hover:bg-gray-700 text-white text-sm
          transition-all duration-200
        "
        title="Очистить кэш"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Очистить кэш</span>
        <span className="sm:hidden">Кэш</span>
      </button>
    </div>
  );
};
