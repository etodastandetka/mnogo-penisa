// Конфигурация FreedomPay
module.exports = {
  // Основные настройки
  projectId: '560745',
  secretKey: 'ICfWiGtk83PSJRyk',
  secretKeyPayout: '7YAYjCE7qwVDm7cY',
  
  // API endpoints
  apiUrl: 'https://api.freedompay.kz',
  initPaymentUrl: 'https://api.freedompay.kz/init_payment.php',
  healthcheckUrl: 'https://api.freedompay.kz/status/healthcheck',
  
  // Настройки платежей
  currency: 'KGS',
  paymentLifetime: 3600, // 1 час в секундах
  
  // URL для перенаправления (должны быть настроены в FreedomPay)
  urls: {
    // Эти URL должны быть настроены в панели FreedomPay
    successUrl: process.env.FREEDOMPAY_SUCCESS_URL || 'https://yourdomain.com/payment/success',
    failureUrl: process.env.FREEDOMPAY_FAILURE_URL || 'https://yourdomain.com/payment/failure',
    resultUrl: process.env.FREEDOMPAY_RESULT_URL || 'https://yourdomain.com/api/payments/freedompay/result',
    checkUrl: process.env.FREEDOMPAY_CHECK_URL || 'https://yourdomain.com/api/payments/freedompay/check'
  },
  
  // Настройки логирования
  logging: {
    enabled: true,
    level: process.env.LOG_LEVEL || 'info',
    saveToFile: process.env.SAVE_LOGS_TO_FILE === 'true'
  },
  
  // Настройки безопасности
  security: {
    signatureAlgorithm: 'md5',
    requestTimeout: 30000, // 30 секунд
    maxRetries: 3
  },
  
  // Настройки webhook
  webhook: {
    enabled: true,
    retryAttempts: 3,
    retryDelay: 5000 // 5 секунд
  },
  
  // Настройки для разработки
  development: {
    testMode: process.env.NODE_ENV === 'development',
    mockResponses: process.env.MOCK_FREEDOMPAY === 'true',
    debugMode: process.env.DEBUG_FREEDOMPAY === 'true'
  }
};
