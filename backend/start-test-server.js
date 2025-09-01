const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключаем роуты для платежей FreedomPay
const paymentRoutes = require('./api/paymentRoutes');
app.use('/api/payments', paymentRoutes);

// Простой healthcheck
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Тестовый сервер запущен'
  });
});

// Главная страница
app.get('/', (req, res) => {
  res.json({
    message: 'Тестовый сервер FreedomPay',
    endpoints: {
      health: '/health',
      freedompay: {
        health: '/api/payments/freedompay/health',
        init: '/api/payments/freedompay/init',
        result: '/api/payments/freedompay/result',
        check: '/api/payments/freedompay/check',
        status: '/api/payments/freedompay/status/:orderId'
      }
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Тестовый сервер запущен на порту ${PORT}`);
  console.log(`📱 URL: http://localhost:${PORT}`);
  console.log(`🏥 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`💰 FreedomPay health: http://localhost:${PORT}/api/payments/freedompay/health`);
  console.log('');
  console.log('Для тестирования FreedomPay запустите:');
  console.log('node test_freedompay.js');
});
