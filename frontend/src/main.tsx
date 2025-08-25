import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Обработка глобальных ошибок для iOS
window.addEventListener('error', (event) => {
  console.error('🚨 Глобальная ошибка:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Необработанная ошибка Promise:', event.reason);
});

// Проверка поддержки необходимых API
const checkBrowserSupport = () => {
  const required = [
    'Promise',
    'fetch',
    'localStorage',
    'sessionStorage'
  ];
  
  const missing = required.filter(api => !(api in window));
  
  if (missing.length > 0) {
    console.error('❌ Отсутствует поддержка API:', missing);
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <h2>Ваш браузер не поддерживается</h2>
        <p>Для работы сайта требуется современный браузер с поддержкой JavaScript.</p>
        <p>Пожалуйста, обновите браузер или используйте Safari, Chrome или Firefox.</p>
      </div>
    `;
    return false;
  }
  
  return true;
};

// Инициализация приложения
const initApp = () => {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Элемент root не найден');
    }
    
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    
    console.log('✅ Приложение успешно инициализировано');
  } catch (error) {
    console.error('❌ Ошибка инициализации приложения:', error);
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <h2>Ошибка загрузки приложения</h2>
        <p>Пожалуйста, обновите страницу или попробуйте позже.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 8px; margin-top: 10px;">
          Обновить страницу
        </button>
      </div>
    `;
  }
};

// Проверяем поддержку браузера и инициализируем приложение
if (checkBrowserSupport()) {
  // Небольшая задержка для стабильности на iOS
  setTimeout(initApp, 100);
}

