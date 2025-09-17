console.log('🔧 Тест с рабочим форматом QR-кода');
console.log('=' .repeat(50));

const crypto = require('crypto');

// Тестовый API
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
    console.log('📤 JSON для запроса:');
    console.log(createCompactJson(requestData));
    console.log('🔐 Hash:', requestData.hash);
    console.log('');
    
    const response = await fetch(config.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestData)
    });
    
    const responseData = await response.json();
    console.log('📥 Ответ API:');
    console.log(JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
    throw error;
  }
}

// Тест с минимальными параметрами (как в рабочем примере)
async function testMinimal() {
  console.log('🧪 Тест с минимальными параметрами');
  console.log('-'.repeat(40));
  
  try {
    const requestData = createRequest('createInvoice', {
      order_id: `test_${Date.now()}`,
      desc: 'Test order',
      amount: 100,
      currency: 'KGS',
      test: 1
    });
    
    const response = await sendRequest(requestData);
    
    if (response.data && response.data.invoice_id) {
      console.log('✅ УСПЕХ! QR-код создан!');
      console.log('Invoice ID:', response.data.invoice_id);
      console.log('QR URL:', response.data.qr_url);
      console.log('EMV QR:', response.data.emv_qr);
      console.log('Link App:', response.data.link_app);
      
      console.log('\n🎉 ВОТ ВАШ QR-КОД!');
      console.log('=' .repeat(50));
      console.log('🔗 Откройте эту ссылку в браузере:');
      console.log(response.data.qr_url);
      console.log('');
      console.log('📱 Или используйте EMV QR для мобильных приложений:');
      console.log(response.data.emv_qr);
      
      return response.data;
    } else {
      console.log('❌ Ошибка:', response.data?.desc || 'Неизвестная ошибка');
      return null;
    }
  } catch (error) {
    console.error('💥 Ошибка:', error.message);
    return null;
  }
}

// Запуск теста
testMinimal();
