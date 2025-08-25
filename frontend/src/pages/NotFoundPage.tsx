import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Utensils } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Анимированный суши */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Utensils className="w-24 h-24 text-orange-500 animate-bounce" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              404
            </div>
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Страница не найдена
        </h2>
        
        {/* Описание */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Упс! Похоже, что эта страница заблудилась в доставке. 
          Возможно, она уже съедена или еще готовится на кухне.
        </p>

        {/* Кнопки */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Вернуться на главную</span>
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">
            Если проблема повторяется, свяжитесь с нами:
          </p>
          <p className="text-sm font-medium text-orange-600 mt-1">
            +996 555 123 456
          </p>
        </div>

        {/* Декоративные элементы */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-orange-300/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-3 h-3 bg-red-300/30 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/2 left-5 w-2 h-2 bg-yellow-300/30 rounded-full animate-ping delay-500"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
