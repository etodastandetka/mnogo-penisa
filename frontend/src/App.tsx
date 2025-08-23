import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/LandingPage';
import { MenuPage } from './pages/HomePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { ImageDebugger } from './components/ImageDebugger';

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageWithNavigation } from './components/PageWithNavigation';
import './index.css';

// Глобальный обработчик ошибок
window.addEventListener('error', (event) => {
  console.error('🚨 Глобальная ошибка JavaScript:', event.error);
  console.error('📍 Файл:', event.filename);
  console.error('📍 Строка:', event.lineno);
  console.error('📍 Колонка:', event.colno);
  
  // Автоматически пытаемся исправить ошибку (только для критических)
  if (event.error && event.error.message) {
    handleGlobalError(event.error);
  }
});

// Обработчик необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Необработанная ошибка Promise:', event.reason);
  
  // Автоматически пытаемся исправить ошибку (только для критических)
  if (event.reason) {
    handleGlobalError(event.reason);
  }
});

// Функция автоматического исправления ошибок (упрощенная для iOS)
const handleGlobalError = (error: any) => {
  try {
    console.log('🔧 Пытаемся автоматически исправить критическую ошибку...');
    
    // Только для действительно критических ошибок на iOS
    if (error && (
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('ERR_FAILED')
    )) {
      console.log('🔄 Критическая ошибка сети - показываем уведомление...');
      
      // Показываем уведомление пользователю (без автоматической перезагрузки)
      showErrorNotification('Обнаружена проблема с загрузкой. Нажмите "Обновить" для исправления.');
    }
  } catch (fixError) {
    console.error('❌ Не удалось обработать ошибку:', fixError);
  }
};

// Функция показа уведомлений об ошибках (упрощенная для iOS)
const showErrorNotification = (message: string) => {
  try {
    // Проверяем поддержку iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // На iOS используем простой alert вместо DOM-манипуляций
      console.log('📱 iOS устройство - показываем alert:', message);
      return; // Не показываем сложные уведомления на iOS
    }
    
    // Создаем простое уведомление для других устройств
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Убираем уведомление через 5 секунд
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  } catch (e) {
    console.error('Не удалось показать уведомление:', e);
  }
};

// Создаем клиент для React Query с улучшенной обработкой ошибок
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('🚨 React Query Error:', error);
      }
    },
    mutations: {
      onError: (error) => {
        console.error('🚨 React Query Mutation Error:', error);
      }
    }
  },
});

// Компонент для обработки ошибок
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; retryCount: number }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    // Увеличиваем счетчик попыток
    this.setState(prevState => ({ retryCount: prevState.retryCount + 1 }));
  }

  // Ручное восстановление (упрощенное для iOS)
  handleRetry = () => {
    try {
      console.log('🔄 Пользователь нажал "Попробовать снова"...');
      
      // Сбрасываем состояние ошибки
      this.setState({ hasError: false, error: undefined });
      
      // Простая перезагрузка страницы
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Ошибка при восстановлении:', error);
      // Если не удалось, просто перезагружаем
      window.location.reload();
    }
  };

  // Принудительное восстановление (упрощенное для iOS)
  handleForceReload = () => {
    try {
      console.log('🔄 Принудительное восстановление...');
      
      // Простая перезагрузка страницы
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Ошибка при принудительном восстановлении:', error);
      // Последняя попытка - hard reload
      window.location.href = window.location.href;
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Что-то пошло не так</h1>
            <p className="text-gray-600 mb-4">
              Произошла ошибка при загрузке страницы. Попробуйте обновить страницу.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors w-full"
              >
                Попробовать снова
              </button>
              
              <button
                onClick={this.handleForceReload}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors w-full"
              >
                Принудительно восстановить
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Попыток восстановления: {this.state.retryCount}
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Если проблема повторяется, попробуйте очистить кеш браузера
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<PageWithNavigation><LandingPage /></PageWithNavigation>} />
              <Route path="/menu" element={<PageWithNavigation><MenuPage /></PageWithNavigation>} />
              <Route path="/contact" element={<PageWithNavigation><ContactPage /></PageWithNavigation>} />
              <Route path="/checkout" element={<PageWithNavigation><CheckoutPage /></PageWithNavigation>} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<PageWithNavigation><ProfilePage /></PageWithNavigation>} />
              
              {/* Отладчик изображений (только в development) */}
              {process.env.NODE_ENV === 'development' && (
                <Route path="/debug-images" element={<ImageDebugger />} />
              )}
              
              {/* Админ-панель */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminOrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminProductsPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/analytics" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              } />
            </Routes>
            
            {/* Уведомления */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                },
              }}
            />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
