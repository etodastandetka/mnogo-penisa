const express = require('express');
const router = express.Router();
const odengiService = require('../odengi-service');
const sqlite3 = require('sqlite3').verbose();

// Создаем подключение к базе данных
const db = new sqlite3.Database('./database.sqlite');

// Создание QR-кода для оплаты
router.post('/create-qr', async (req, res) => {
  try {
    const { orderId, amount, description, customerPhone } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Необходимы orderId и amount'
      });
    }

    // Создаем инвойс через O!Dengi
    const result = await odengiService.createInvoice({
      orderId,
      amount: parseFloat(amount),
      description,
      customerPhone,
      resultUrl: `${req.protocol}://${req.get('host')}/api/odengi/callback`
    });

    if (result.success) {
      // Сохраняем информацию об инвойсе в базу данных
      db.run(`
        INSERT OR REPLACE INTO odengi_invoices 
        (order_id, invoice_id, qr_url, amount, currency, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        result.invoiceId,
        result.qrUrl,
        result.amount,
        result.currency,
        'pending',
        new Date().toISOString()
      ], function(err) {
        if (err) {
          console.error('Ошибка сохранения инвойса в БД:', err);
        }
      });

      res.json({
        success: true,
        qrUrl: result.qrUrl,
        invoiceId: result.invoiceId,
        amount: result.amount,
        currency: result.currency
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Ошибка создания QR-кода:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Проверка статуса платежа
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Получаем информацию об инвойсе из БД
    const invoice = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM odengi_invoices WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
        [orderId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Инвойс не найден'
      });
    }

    // Проверяем статус через API
    const statusResult = await odengiService.checkPaymentStatus(
      invoice.invoice_id,
      orderId
    );

    if (statusResult.success) {
      // Обновляем статус в БД
      db.run(
        'UPDATE odengi_invoices SET status = ?, updated_at = ? WHERE invoice_id = ?',
        [statusResult.status === 3 ? 'paid' : 'pending', new Date().toISOString(), invoice.invoice_id]
      );

      res.json({
        success: true,
        status: statusResult.status === 3 ? 'paid' : 'pending',
        amount: statusResult.amount / 100, // Конвертируем в сомы
        currency: statusResult.currency,
        transId: statusResult.transId
      });
    } else {
      res.json({
        success: false,
        error: statusResult.error
      });
    }
  } catch (error) {
    console.error('Ошибка проверки статуса:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Callback от O!Dengi (webhook)
router.post('/callback', async (req, res) => {
  try {
    console.log('📨 Получен callback от O!Dengi:', JSON.stringify(req.body, null, 2));
    
    // Обрабатываем callback
    const result = odengiService.processCallback(req.body);
    
    if (!result.success) {
      console.error('❌ Ошибка обработки callback:', result.error);
      return res.status(400).json({ error: result.error });
    }

    // Обновляем статус в БД
    db.run(`
      UPDATE odengi_invoices 
      SET status = ?, trans_id = ?, updated_at = ?
      WHERE order_id = ?
    `, [
      result.status,
      result.transId,
      new Date().toISOString(),
      result.orderId
    ], function(err) {
      if (err) {
        console.error('Ошибка обновления статуса в БД:', err);
      }
    });

    // Обновляем статус заказа
    if (result.status === 'paid') {
      db.run(`
        UPDATE orders 
        SET payment_status = 'paid', payment_method = 'odengi_qr'
        WHERE id = ?
      `, [result.orderId], function(err) {
        if (err) {
          console.error('Ошибка обновления заказа:', err);
        } else {
          console.log('✅ Заказ обновлен как оплаченный');
        }
      });
    }

    // Отвечаем O!Dengi что получили уведомление
    res.json({ status: 'ok' });
    
  } catch (error) {
    console.error('Ошибка обработки callback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Отмена инвойса
router.post('/cancel/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const result = await odengiService.cancelInvoice(invoiceId);
    
    if (result.success) {
      // Обновляем статус в БД
      db.run(
        'UPDATE odengi_invoices SET status = ?, updated_at = ? WHERE invoice_id = ?',
        ['cancelled', new Date().toISOString(), invoiceId]
      );

      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Ошибка отмены инвойса:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Получение истории платежей
router.get('/history', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let query = 'SELECT * FROM odengi_invoices WHERE 1=1';
    const params = [];
    
    if (dateFrom) {
      query += ' AND created_at >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ' AND created_at <= ?';
      params.push(dateTo);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const invoices = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      invoices: invoices.map(invoice => ({
        ...invoice,
        amount: invoice.amount / 100 // Конвертируем в сомы
      }))
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;
