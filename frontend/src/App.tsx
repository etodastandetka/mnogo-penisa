import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/LandingPage';
import { MenuPage } from './pages/HomePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { ImageDebugger } from './components/ImageDebugger';
import { CartPage } from './pages/CartPage';

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageWithNavigation } from './components/PageWithNavigation';
import './index.css';

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
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Routes>
          <Route path="/" element={<PageWithNavigation><LandingPage /></PageWithNavigation>} />
          <Route path="/menu" element={<PageWithNavigation><MenuPage /></PageWithNavigation>} />
          <Route path="/contact" element={<PageWithNavigation><ContactPage /></PageWithNavigation>} />
          <Route path="/checkout" element={<PageWithNavigation><CheckoutPage /></PageWithNavigation>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<PageWithNavigation><ProfilePage /></PageWithNavigation>} />
          <Route path="/cart" element={<PageWithNavigation><CartPage /></PageWithNavigation>} />
          
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
    </QueryClientProvider>
  );
}

export default App;
