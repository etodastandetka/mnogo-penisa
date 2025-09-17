console.log('🚀 Полный тест O!Dengi API');
console.log('=' .repeat(50));

const crypto = require('crypto');

// Конфигурация
const config = {
  version: 1005,
  sid: '2310370542',
  password: '#S5@8E#G3B(1J4W',
  serverUrl: 'https://mw-api-test.dengi.kg/api/json/json.php',
  lang: 'ru'
};

// Функция создания подписи
function createHash(jsonString, password) {
  return crypto.createHmac('md5', password).update(jsonString).digest('hex');
}

// Создание JSON без пробелов
function createCompactJson(obj) {
  return JSON.stringify(obj, null, '').replace(/\s+/g, '');
}

// Создание запроса
function createRequest(cmd, data) {
  const mktime = Date.now().toString();
  
  const requestData = {
    cmd,
    version: config.version,
    sid: config.sid,
    mktime,
    lang: config.lang,
    data
  };
  
  const jsonString = createCompactJson(requestData);
  const hash = createHash(jsonString, config.password);
  requestData.hash = hash;
  
  return requestData;
}

// Отправка запроса
async function sendRequest(requestData) {
  try {
    console.log('📤 Отправляем запрос:', JSON.stringify(requestData, null, 2));
    
    const response = await fetch(config.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestData)
    });
    
    const responseData = await response.json();
    console.log('📥 Получен ответ:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
    throw error;
  }
}

// Тест 1: getOTP
async function testGetOTP() {
  console.log('\n🧪 ТЕСТ 1: getOTP');
  console.log('-' .repeat(30));
  
  try {
    const requestData = createRequest('getOTP', { return_url: null });
    const response = await sendRequest(requestData);
    
    if (response.status === 'ok') {
      console.log('✅ OTP получен успешно');
      return response.otp;
    } else {
      console.log('❌ Ошибка:', response.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка теста getOTP:', error);
    return null;
  }
}

// Тест 2: createInvoice
async function testCreateInvoice() {
  console.log('\n🧪 ТЕСТ 2: createInvoice');
  console.log('-' .repeat(30));
  
  try {
    const orderId = `test_${Date.now()}`;
    const amount = 1000; // 10 сом в копейках
    
    const requestData = createRequest('createInvoice', {
      order_id: orderId,
      desc: 'Тестовый заказ O!Dengi',
      amount: amount,
      currency: 'KGS',
      test: 1,
      long_term: 0
    });
    
    const response = await sendRequest(requestData);
    
    if (response.status === 'ok') {
      console.log('✅ Инвойс создан успешно');
      console.log('Invoice ID:', response.invoice_id);
      console.log('QR URL:', response.qr_url);
      return {
        invoiceId: response.invoice_id,
        qrUrl: response.qr_url,
        orderId: response.order_id
      };
    } else {
      console.log('❌ Ошибка:', response.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка теста createInvoice:', error);
    return null;
  }
}

// Тест 3: statusPayment
async function testStatusPayment(invoiceId, orderId) {
  console.log('\n🧪 ТЕСТ 3: statusPayment');
  console.log('-' .repeat(30));
  
  try {
    const requestData = createRequest('statusPayment', {
      invoice_id: invoiceId,
      order_id: orderId,
      mark: 0
    });
    
    const response = await sendRequest(requestData);
    
    if (response.status === 'ok') {
      console.log('✅ Статус получен успешно');
      console.log('Status:', response.status_pay);
      console.log('Amount:', response.amount);
      return response;
    } else {
      console.log('❌ Ошибка:', response.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка теста statusPayment:', error);
    return null;
  }
}

// Главная функция
async function runTests() {
  try {
    // Тест 1: getOTP
    const otp = await testGetOTP();
    
    // Тест 2: createInvoice
    const invoice = await testCreateInvoice();
    
    if (invoice) {
      // Тест 3: statusPayment
      await testStatusPayment(invoice.invoiceId, invoice.orderId);
    }
    
    console.log('\n🎉 ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА:', error);
  }
}

// Запуск тестов
runTests();
