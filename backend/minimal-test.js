console.log('🎯 Минимальный тест O!Dengi API');
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
    console.log('JSON:', JSON.stringify(requestData, null, 2));
    
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

// Тест с минимальными параметрами
async function testMinimal() {
  console.log('\n🧪 ТЕСТ: createInvoice с минимальными параметрами');
  console.log('-' .repeat(50));
  
  try {
    const orderId = `test_${Date.now()}`;
    
    const requestData = createRequest('createInvoice', {
      order_id: orderId,
      desc: 'Test order',
      amount: 100, // 1 сом в копейках
      currency: 'KGS',
      test: 1
    });
    
    const response = await sendRequest(requestData);
    
    if (response.data && response.data.error) {
      console.log('❌ Ошибка API:', response.data.desc);
      console.log('Код ошибки:', response.data.error);
    } else if (response.data && response.data.invoice_id) {
      console.log('✅ Инвойс создан успешно!');
      console.log('Invoice ID:', response.data.invoice_id);
      console.log('QR URL:', response.data.qr_url);
    } else {
      console.log('❓ Неожиданный ответ:', response);
    }
    
  } catch (error) {
    console.error('❌ Ошибка теста:', error);
  }
}

// Запуск теста
testMinimal();
