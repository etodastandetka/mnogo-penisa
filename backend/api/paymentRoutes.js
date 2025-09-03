const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');

const router = express.Router();

// Подключение к базе данных
const dbPath = path.join(__dirname, '../data/mnogo_rolly.db');
const db = new sqlite3.Database(dbPath);

// Импортируем сервис QR-платежей
const { qrPaymentService } = require('./qrPaymentService');

// Middleware для логирования
const logPaymentRequest = (req, res, next) => {
  console.log('💰 Payment: Входящий запрос', {
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query
  });
  next();
};

router.use(logPaymentRequest);

/**
 * Получение списка доступных банков для QR-платежей
 * GET /api/payments/banks
 */
router.get('/banks', (req, res) => {
  try {
    const banks = qrPaymentService.getAvailableBanks();
    
    res.json({
      success: true,
      banks
    });
  } catch (error) {
    console.error('❌ Ошибка получения списка банков:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения списка банков'
    });
  }
});

/**
 * Генерация QR-кода для оплаты
 * POST /api/payments/qr/generate
 */
router.post('/qr/generate', async (req, res) => {
  try {
    const { orderId, amount, bank = 'mbank' } = req.body;

    // Валидация входных данных
    const validation = qrPaymentService.validateOrderData({ orderId, amount });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: validation.errors
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

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Заказ уже обработан'
      });
    }

    // Генерируем QR-код
    const qrResult = qrPaymentService.generateQRCode({
      orderId: orderId.toString(),
      amount: parseFloat(amount)
    }, bank);

    if (!qrResult.success) {
      return res.status(400).json({
        success: false,
        message: qrResult.error
      });
    }

    // Сохраняем информацию о платеже в базу
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO payment_transactions (
          order_id, payment_id, amount, status, payment_method, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [orderId, `qr_${orderId}_${Date.now()}`, amount, 'pending', 'qr'],
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

    res.json({
      success: true,
      qrUrl: qrResult.qrUrl,
      bank: qrResult.bank,
      orderId: qrResult.orderId,
      amount: qrResult.amount,
      message: 'QR-код сгенерирован успешно'
    });

  } catch (error) {
    console.error('❌ Ошибка генерации QR-кода:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: error.message
    });
  }
});

/**
 * Подтверждение оплаты (для QR и наличных)
 * POST /api/payments/confirm
 */
router.post('/confirm', async (req, res) => {
  try {
    const { orderId, paymentMethod, cashAmount, changeAmount } = req.body;

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
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    // Обновляем транзакцию
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE payment_transactions 
         SET status = ?, updated_at = datetime('now')
         WHERE order_id = ?`,
        ['completed', orderId],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });

    // Обновляем статус заказа
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE orders 
         SET status = ?, payment_status = ?, updated_at = datetime('now')
         WHERE id = ?`,
        ['paid', 'paid', orderId],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });

    // Если наличные, сохраняем информацию о сдаче
    if (paymentMethod === 'cash' && cashAmount && changeAmount) {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE payment_transactions 
           SET cash_amount = ?, change_amount = ?, updated_at = datetime('now')
           WHERE order_id = ?`,
          [cashAmount, changeAmount, orderId],
          (err) => {
            if (err) reject(err);
            else resolve(true);
          }
        );
      });
    }

    console.log(`✅ Платеж подтвержден для заказа ${orderId}, метод: ${paymentMethod}`);

    res.json({
      success: true,
      message: 'Платеж подтвержден успешно',
      orderId,
      paymentMethod,
      cashAmount,
      changeAmount
    });

  } catch (error) {
    console.error('❌ Ошибка подтверждения платежа:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: error.message
    });
  }
});

/**
 * Получение статуса платежа
 * GET /api/payments/status/:orderId
 */
router.get('/status/:orderId', async (req, res) => {
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

    res.json({
      success: true,
      data: {
        orderId: transaction.order_id,
        paymentId: transaction.payment_id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.payment_method,
        orderStatus: transaction.order_status,
        paymentStatus: transaction.payment_status,
        cashAmount: transaction.cash_amount,
        changeAmount: transaction.change_amount,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      }
    });
  } catch (error) {
    console.error('❌ Ошибка получения статуса платежа:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

/**
 * Healthcheck
 * GET /api/payments/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    healthy: true,
    timestamp: new Date().toISOString(),
    service: 'Payment System',
    mode: 'production',
    features: ['qr', 'card', 'cash']
  });
});

module.exports = router;
