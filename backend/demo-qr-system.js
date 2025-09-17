console.log('🎯 Демонстрационная система QR-оплаты');
console.log('=' .repeat(60));

// Симуляция создания QR-кода
function createDemoQRCode(orderId, amount) {
  const qrData = {
    orderId: orderId,
    amount: amount,
    currency: 'KGS',
    merchant: 'Ваш магазин',
    timestamp: new Date().toISOString()
  };
  
  // Создаем демо QR-код (в реальности это будет через O!Dengi API)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`;
  
  return {
    invoiceId: `demo_${Date.now()}`,
    qrUrl: qrUrl,
    emvQr: `00020101021232490011qr.dengi.kg0102201112${orderId}12021213021252047372530341754031005915${orderId}6304F0C0`,
    linkApp: `https://o.kg/l/a?t=wl_unpbill&id=demo_${Date.now()}`,
    orderId: orderId,
    amount: amount
  };
}

// Симуляция проверки статуса платежа
function checkPaymentStatus(invoiceId) {
  // В реальности это будет запрос к O!Dengi API
  const statuses = ['pending', 'paid', 'cancelled'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    status: randomStatus,
    message: randomStatus === 'paid' ? 'Платеж успешно выполнен!' : 
             randomStatus === 'cancelled' ? 'Платеж отменен' : 'Ожидание оплаты...'
  };
}

// Демонстрация работы системы
function demonstrateQRSystem() {
  console.log('🚀 Демонстрация системы QR-оплаты');
  console.log('=' .repeat(50));
  
  // Создаем демо заказ
  const orderId = `order_${Date.now()}`;
  const amount = 1500; // 15 сом в копейках
  
  console.log('📋 Создаем заказ:');
  console.log('Order ID:', orderId);
  console.log('Amount:', amount, 'копеек (', amount/100, 'сом)');
  console.log('');
  
  // Создаем QR-код
  console.log('🔧 Создаем QR-код...');
  const qrData = createDemoQRCode(orderId, amount);
  
  console.log('✅ QR-код создан!');
  console.log('Invoice ID:', qrData.invoiceId);
  console.log('');
  
  console.log('🔗 QR-ССЫЛКИ:');
  console.log('QR URL (для отображения):', qrData.qrUrl);
  console.log('EMV QR (для мобильных):', qrData.emvQr);
  console.log('Link App (для приложения):', qrData.linkApp);
  console.log('');
  
  console.log('📱 Как это работает в приложении:');
  console.log('1. Пользователь выбирает "O!Dengi" в способах оплаты');
  console.log('2. Система создает QR-код через API O!Dengi');
  console.log('3. Пользователь видит QR-код на экране');
  console.log('4. Пользователь сканирует QR-код в приложении O!Dengi');
  console.log('5. Система автоматически проверяет статус оплаты');
  console.log('');
  
  // Симулируем проверку статуса
  console.log('🔄 Проверяем статус платежа...');
  setTimeout(() => {
    const status = checkPaymentStatus(qrData.invoiceId);
    console.log('Status:', status.status);
    console.log('Message:', status.message);
    
    if (status.status === 'paid') {
      console.log('🎉 Платеж успешно выполнен!');
      console.log('✅ Заказ обновлен как оплаченный');
    }
  }, 2000);
  
  console.log('');
  console.log('🎯 ВАШ QR-КОД ГОТОВ!');
  console.log('=' .repeat(50));
  console.log('🔗 Откройте эту ссылку в браузере, чтобы увидеть QR-код:');
  console.log(qrData.qrUrl);
  console.log('');
  console.log('📱 Или используйте EMV QR для мобильных приложений:');
  console.log(qrData.emvQr);
  console.log('');
  console.log('⚠️  Примечание: Это демо QR-код для тестирования');
  console.log('   В реальном приложении QR-код будет создан через O!Dengi API');
}

// Запуск демонстрации
demonstrateQRSystem();
