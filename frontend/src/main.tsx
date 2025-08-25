import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Универсальная обработка ошибок для всех устройств
const handleGlobalError = (event: ErrorEvent) => {
  console.error('🚨 Глобальная ошибка:', event.error);
  showFallbackUI('Произошла ошибка при загрузке страницы');
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('🚨 Необработанная ошибка Promise:', event.reason);
  showFallbackUI('Ошибка загрузки данных');
};

// Показ запасного интерфейса
const showFallbackUI = (message: string) => {
  const fallbackHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 999999;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 16px;
        text-align: center;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      ">
        <div style="
          width: 60px;
          height: 60px;
          background: #fef3c7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        ">
          <span style="font-size: 30px;">🍣</span>
        </div>
        <h2 style="
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 600;
        ">Mnogo Rolly</h2>
        <p style="
          margin: 0 0 20px 0;
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
        ">${message}</p>
        <button onclick="location.reload()" style="
          background: #f97316;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        " onmouseover="this.style.background='#ea580c'" onmouseout="this.style.background='#f97316'">
          Обновить страницу
        </button>
      </div>
    </div>
  `;
  
  document.body.innerHTML = fallbackHTML;
};

// Проверка поддержки браузера
const checkBrowserSupport = () => {
  try {
    // Проверяем основные API
    const requiredAPIs = [
      'Promise',
      'fetch',
      'localStorage',
      'sessionStorage',
      'addEventListener'
    ];
    
    const missing = requiredAPIs.filter(api => !(api in window));
    
    if (missing.length > 0) {
      console.error('❌ Отсутствует поддержка API:', missing);
      showFallbackUI('Ваш браузер не поддерживается. Пожалуйста, обновите браузер.');
      return false;
    }
    
    // Проверяем поддержку DOM
    if (!document || !document.createElement) {
      showFallbackUI('Ошибка загрузки страницы');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка проверки браузера:', error);
    showFallbackUI('Ошибка инициализации');
    return false;
  }
};

// Инициализация приложения с множественными попытками
const initApp = async (attempts = 0) => {
  const maxAttempts = 3;
  
  try {
    console.log(`🔄 Попытка инициализации ${attempts + 1}/${maxAttempts}`);
    
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Элемент root не найден');
    }
    
    // Очищаем содержимое root
    rootElement.innerHTML = '';
    
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    
    console.log('✅ Приложение успешно инициализировано');
    
    // Удаляем обработчики ошибок после успешной инициализации
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    
  } catch (error) {
    console.error(`❌ Ошибка инициализации (попытка ${attempts + 1}):`, error);
    
    if (attempts < maxAttempts - 1) {
      // Повторная попытка через 1 секунду
      setTimeout(() => initApp(attempts + 1), 1000);
    } else {
      showFallbackUI('Не удалось загрузить приложение. Пожалуйста, обновите страницу.');
    }
  }
};

// Регистрируем обработчики ошибок
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// Проверяем готовность DOM
const waitForDOM = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (checkBrowserSupport()) {
        // Небольшая задержка для стабильности на мобильных устройствах
        setTimeout(() => initApp(), 200);
      }
    });
  } else {
    if (checkBrowserSupport()) {
      setTimeout(() => initApp(), 200);
    }
  }
};

// Запускаем инициализацию
waitForDOM();

