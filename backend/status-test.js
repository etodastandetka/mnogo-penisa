console.log('🔍 Тест проверки статуса платежа O!Dengi');
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
    console.log('📤 Отправляем запрос...');
    console.log('Команда:', requestData.cmd);
    
    const response = await fetch(config.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestData)
    });
    
    const responseData = await response.json();
    console.log('📥 Получен ответ:');
    console.log(JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
    throw error;
  }
}

// Тест проверки статуса
async function testStatusPayment() {
  console.log('\n🧪 ТЕСТ: statusPayment');
  console.log('-' .repeat(30));
  
  try {
    // Используем invoice_id из предыдущего теста
    const invoiceId = '649313216038';
    const orderId = 'test_175808557425879';
    
    const requestData = createRequest('statusPayment', {
      invoice_id: invoiceId,
      order_id: orderId,
      mark: 0
    });
    
    const response = await sendRequest(requestData);
    
    if (response.data && response.data.error) {
      console.log('❌ Ошибка API:', response.data.desc);
      console.log('Код ошибки:', response.data.error);
    } else if (response.data) {
      console.log('✅ Статус получен успешно!');
      console.log('Status Pay:', response.data.status_pay);
      console.log('Amount:', response.data.amount);
      console.log('Currency:', response.data.currency);
      console.log('Order ID:', response.data.order_id);
      
      // Расшифровка статуса
      const statusMap = {
        1: 'В ожидании оплаты',
        2: 'Транзакция отменена', 
        3: 'Платеж оплачен'
      };
      
      const statusText = statusMap[response.data.status_pay] || 'Неизвестный статус';
      console.log('Статус:', statusText);
    } else {
      console.log('❓ Неожиданный ответ:', response);
    }
    
  } catch (error) {
    console.error('❌ Ошибка теста:', error);
  }
}

// Тест отмены инвойса
async function testCancelInvoice() {
  console.log('\n🧪 ТЕСТ: invoiceCancel');
  console.log('-' .repeat(30));
  
  try {
    const invoiceId = '649313216038';
    
    const requestData = createRequest('invoiceCancel', {
      invoice_id: invoiceId
    });
    
    const response = await sendRequest(requestData);
    
    if (response.data && response.data.error) {
      console.log('❌ Ошибка API:', response.data.desc);
      console.log('Код ошибки:', response.data.error);
    } else if (response.data) {
      console.log('✅ Инвойс отменен успешно!');
      console.log('Ответ:', response.data);
    } else {
      console.log('❓ Неожиданный ответ:', response);
    }
    
  } catch (error) {
    console.error('❌ Ошибка теста:', error);
  }
}

// Главная функция
async function runTests() {
  try {
    // Тест 1: Проверка статуса
    await testStatusPayment();
    
    // Небольшая пауза
    console.log('\n⏳ Ожидание 2 секунды...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Тест 2: Отмена инвойса
    await testCancelInvoice();
    
    console.log('\n🎉 ТЕСТЫ ЗАВЕРШЕНЫ!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА:', error);
  }
}

// Запуск тестов
runTests();
