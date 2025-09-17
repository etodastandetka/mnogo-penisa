const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Простой API для создания QR-кода (демо)
app.post('/api/odengi/create-qr', (req, res) => {
  console.log('📱 Создание QR-кода:', req.body);
  
  const { orderId, amount, description } = req.body;
  
  // Создаем демо QR-код
  const qrData = {
    orderId: orderId,
    amount: amount,
    currency: 'KGS',
    merchant: 'Mnogo Rolly',
    timestamp: new Date().toISOString()
  };
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`;
  
  res.json({
    success: true,
    qrUrl: qrUrl,
    invoiceId: `demo_${Date.now()}`,
    amount: amount,
    currency: 'KGS'
  });
});

// API для продуктов (демо)
app.get('/api/products', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Запеченный с кокосом',
      price: 480,
      image_url: '/placeholder.jpg',
      description: 'Вкусный ролл с кокосом'
    }
  ]);
});

// API для создания заказа (демо)
app.post('/api/orders', (req, res) => {
  console.log('📦 Создание заказа:', req.body);
  
  const orderId = Math.floor(Math.random() * 10000) + 1;
  
  res.json({
    success: true,
    orderId: orderId,
    message: 'Заказ создан успешно'
  });
});

// Все остальные запросы отправляем на frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 API доступен по адресу: http://localhost:${PORT}`);
  console.log(`🌐 Сайт доступен по адресу: http://localhost:${PORT}`);
});
