import express from 'express';
import { freedomPayService } from './freedompay';
import sqlite3 from 'sqlite3';
import path from 'path';

const router = express.Router();

// Подключение к базе данных
const dbPath = path.join(__dirname, '../data/mnogo_rolly.db');
const db = new sqlite3.Database(dbPath);

// Middleware для логирования
const logPaymentRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('💰 FreedomPay: Входящий запрос', {
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
};

// Применяем логирование ко всем роутам
router.use(logPaymentRequest);

/**
 * Инициализация платежа
 * POST /api/payments/freedompay/init
 */
router.post('/freedompay/init', async (req, res) => {
  try {
    const { orderId, amount, description } = req.body;

    // Валидация входных данных
    if (!orderId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Отсутствуют обязательные поля: orderId, amount, description'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Сумма должна быть больше нуля'
      });
    }

    // Проверяем существование заказа в базе
    const order = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, total_amount, status FROM orders WHERE id = ?',
        [orderId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    if ((order as any).status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Заказ уже обработан'
      });
    }

    // Формируем URL для перенаправления
    // Конфигурация прямо в коде, так как .env не работает на сервере
    const baseUrl = 'http://localhost:3000'; // Замените на ваш домен в продакшене
    const urls = {
      successUrl: `${baseUrl}/payment/success`,
      failureUrl: `${baseUrl}/payment/failure`,
      resultUrl: `${baseUrl}/api/payments/freedompay/result`,
      checkUrl: `${baseUrl}/api/payments/freedompay/check`
    };

    // Инициализируем платеж в FreedomPay
    const paymentResult = await freedomPayService.initPayment({
      orderId: orderId.toString(),
      amount: parseFloat(amount),
      description,
      ...urls
    });

    if (paymentResult.pg_status === 'ok' && paymentResult.pg_redirect_url) {
      // Сохраняем информацию о платеже в базу
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO payment_transactions (
            order_id, payment_id, amount, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [orderId, paymentResult.pg_payment_id || 'pending', amount, 'pending'],
          (err) => {
            if (err) reject(err);
            else resolve(true);
          }
        );
      });

      // Обновляем статус заказа
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE orders SET payment_status = ? WHERE id = ?',
          ['processing', orderId],
          (err) => {
            if (err) reject(err);
            else resolve(true);
          }
        );
      });

      return res.json({
        success: true,
        paymentUrl: paymentResult.pg_redirect_url,
        paymentId: paymentResult.pg_payment_id,
        message: 'Платеж инициализирован успешно'
      });
    } else {
      // Логируем ошибку
      console.error('❌ FreedomPay: Ошибка инициализации', paymentResult);
      
      return res.status(400).json({
        success: false,
        message: paymentResult.pg_error_description || 'Ошибка инициализации платежа',
        errorCode: paymentResult.pg_error_code
      });
    }
  } catch (error: any) {
    console.error('❌ FreedomPay: Ошибка инициализации платежа', error);
    
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: error.message
    });
  }
});

/**
 * Обработка результата платежа (webhook от FreedomPay)
 * POST /api/payments/freedompay/result
 */
router.post('/freedompay/result', async (req, res) => {
  try {
    console.log('💰 FreedomPay: Получено уведомление о результате платежа', req.body);

    // Обрабатываем результат платежа
    const result = freedomPayService.processPaymentResult(req.body);

    if (!result.isValid) {
      console.error('❌ FreedomPay: Неверная подпись уведомления');
      return res.status(400).json({ error: 'INVALID_SIGNATURE' });
    }

    // Обновляем транзакцию в базе
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE payment_transactions 
         SET status = ?, updated_at = datetime('now')
         WHERE order_id = ?`,
        [result.isSuccess ? 'completed' : 'failed', result.orderId],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });

    // Обновляем статус заказа
    const newOrderStatus = result.isSuccess ? 'paid' : 'payment_failed';
    const newPaymentStatus = result.isSuccess ? 'paid' : 'failed';

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE orders 
         SET status = ?, payment_status = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [newOrderStatus, newPaymentStatus, result.orderId],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });

    // Логируем результат
    console.log(`✅ FreedomPay: Платеж ${result.isSuccess ? 'успешен' : 'неуспешен'} для заказа ${result.orderId}`);

    // Отправляем ответ FreedomPay
    res.json({ result: 'OK' });
  } catch (error: any) {
    console.error('❌ FreedomPay: Ошибка обработки результата платежа', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

/**
 * Проверка возможности приема платежа
 * POST /api/payments/freedompay/check
 */
router.post('/freedompay/check', async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    console.log('🔍 FreedomPay: Проверка возможности приема платежа', { orderId, amount });

    // Проверяем существование заказа
    const order = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, total_amount, status FROM orders WHERE id = ?',
        [orderId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!order) {
      return res.json({ result: 'REJECTED', reason: 'ORDER_NOT_FOUND' });
    }

    if ((order as any).status !== 'pending') {
      return res.json({ result: 'REJECTED', reason: 'ORDER_ALREADY_PROCESSED' });
    }

    if (Math.abs((order as any).total_amount - amount) > 0.01) {
      return res.json({ result: 'REJECTED', reason: 'AMOUNT_MISMATCH' });
    }

    // Проверяем доступность сервиса
    const isHealthy = await freedomPayService.checkHealth();
    if (!isHealthy) {
      return res.json({ result: 'REJECTED', reason: 'SERVICE_UNAVAILABLE' });
    }

    console.log('✅ FreedomPay: Платеж разрешен для заказа', orderId);
    return res.json({ result: 'OK' });
  } catch (error: any) {
    console.error('❌ FreedomPay: Ошибка проверки платежа', error);
    return res.json({ result: 'REJECTED', reason: 'INTERNAL_ERROR' });
  }
});

/**
 * Получение статуса платежа
 * GET /api/payments/freedompay/status/:orderId
 */
router.get('/freedompay/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const transaction = await new Promise((resolve, reject) => {
      db.get(
        `SELECT pt.*, o.status as order_status, o.payment_status 
         FROM payment_transactions pt
         JOIN orders o ON pt.order_id = o.id
         WHERE pt.order_id = ?`,
        [orderId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Транзакция не найдена'
      });
    }

    return res.json({
      success: true,
      data: {
        orderId: transaction.order_id,
        paymentId: transaction.payment_id,
        amount: transaction.amount,
        status: transaction.status,
        orderStatus: transaction.order_status,
        paymentStatus: transaction.payment_status,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      }
    });
  } catch (error: any) {
    console.error('❌ FreedomPay: Ошибка получения статуса платежа', error);
    
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

/**
 * Healthcheck для FreedomPay
 * GET /api/payments/freedompay/health
 */
router.get('/freedompay/health', async (req, res) => {
  try {
    const isHealthy = await freedomPayService.checkHealth();
    
    return res.json({
      success: true,
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      service: 'FreedomPay'
    });
  } catch (error: any) {
    console.error('❌ FreedomPay: Ошибка healthcheck', error);
    
    return res.status(500).json({
      success: false,
      healthy: false,
      error: error.message
    });
  }
});

export default router;
