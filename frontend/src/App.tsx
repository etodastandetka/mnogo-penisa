import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/LandingPage';
import { ImageDebugger } from './components/ImageDebugger';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageWithNavigation } from './components/PageWithNavigation';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Ленивая загрузка страниц для лучшей производительности
const HomePage = lazy(() => import('./pages/HomePage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CartPage = lazy(() => import('./pages/CartPage'));

// Админ страницы
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));


// Простой клиент для React Query без сложных настроек
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <Routes>
          <Route path="/" element={<PageWithNavigation><LandingPage /></PageWithNavigation>} />
          <Route path="/menu" element={
            <PageWithNavigation>
              <Suspense fallback={<LoadingSpinner />}>
                <HomePage />
              </Suspense>
            </PageWithNavigation>
          } />
          <Route path="/contact" element={
            <PageWithNavigation>
              <Suspense fallback={<LoadingSpinner />}>
                <ContactPage />
              </Suspense>
            </PageWithNavigation>
          } />
          <Route path="/checkout" element={
            <PageWithNavigation>
              <Suspense fallback={<LoadingSpinner />}>
                <CheckoutPage />
              </Suspense>
            </PageWithNavigation>
          } />
          <Route path="/order-success/:orderId" element={
            <PageWithNavigation>
              <Suspense fallback={<LoadingSpinner />}>
                <OrderSuccessPage />
              </Suspense>
            </PageWithNavigation>
          } />
          <Route path="/auth" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AuthPage />
            </Suspense>
          } />
          <Route path="/profile" element={
            <PageWithNavigation>
              <Suspense fallback={<LoadingSpinner />}>
                <ProfilePage />
              </Suspense>
            </PageWithNavigation>
          } />
          <Route path="/cart" element={
            <PageWithNavigation>
              <Suspense fallback={<LoadingSpinner />}>
                <CartPage />
              </Suspense>
            </PageWithNavigation>
          } />
          
          {/* Отладчик изображений (только в development) */}
          {process.env.NODE_ENV === 'development' && (
            <Route path="/debug-images" element={<ImageDebugger />} />
          )}
          
          {/* Админ-панель */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminDashboardPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminDashboardPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminOrdersPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminProductsPage />
              </Suspense>
            </ProtectedRoute>
          } />

          <Route path="/admin/analytics" element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminAnalyticsPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminSettingsPage />
              </Suspense>
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
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
