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
});

// Обработчик необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Необработанная ошибка Promise:', event.reason);
});

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
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
  }

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
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Обновить страницу
            </button>
            <div className="mt-4 text-xs text-gray-500">
              Если проблема повторяется, попробуйте очистить кэш браузера
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
