const express = require('express');
const multer = require('multer');
const path = require('path');
const Receipt = require('../models/Receipt');
const Order = require('../models/Order');

const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/receipts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Только изображения и PDF файлы разрешены'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Получить все чеки (для админки)
router.get('/', async (req, res) => {
  try {
    const receipts = await Receipt.find()
      .populate('orderId', 'customerName phone address totalAmount')
      .sort({ createdAt: -1 });
    
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении чеков', error: error.message });
  }
});

// Получить чек по ID
router.get('/:id', async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('orderId', 'customerName phone address totalAmount items');
    
    if (!receipt) {
      return res.status(404).json({ message: 'Чек не найден' });
    }
    
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении чека', error: error.message });
  }
});

// Создать новый чек
router.post('/', upload.single('receiptFile'), async (req, res) => {
  try {
    const { orderId, paymentMethod, amount, note } = req.body;
    
    // Проверяем существование заказа
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    
    const receiptData = {
      orderId,
      paymentMethod,
      amount: parseFloat(amount),
      note
    };
    
    // Если загружен файл чека
    if (req.file) {
      receiptData.receiptFile = `/uploads/receipts/${req.file.filename}`;
    }
    
    const receipt = new Receipt(receiptData);
    await receipt.save();
    
    // Обновляем статус заказа
    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod;
    await order.save();
    
    res.status(201).json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании чека', error: error.message });
  }
});

// Обновить статус чека (для админки)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const receipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('orderId');
    
    if (!receipt) {
      return res.status(404).json({ message: 'Чек не найден' });
    }
    
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса', error: error.message });
  }
});

// Удалить чек (для админки)
router.delete('/:id', async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({ message: 'Чек не найден' });
    }
    
    res.json({ message: 'Чек успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении чека', error: error.message });
  }
});

module.exports = router;
