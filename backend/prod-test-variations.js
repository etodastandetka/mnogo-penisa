console.log('🔍 Тестирование различных вариантов для продакшн API O!Dengi');
console.log('=' .repeat(70));

const crypto = require('crypto');

// Продакшн конфигурация
const config = {
  version: 1005,
  sid: '5240752550',
  password: 'R^@OVPC|5@{64}G',
  serverUrl: 'https://api.dengi.o.kg/api/json/json.php',
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
    const response = await fetch(config.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestData)
    });
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
    throw error;
  }
}

// Тест различных вариантов
async function testVariations() {
  const variations = [
    {
      name: '1. Только обязательные параметры',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test order',
        amount: 100,
        currency: 'KGS'
      }
    },
    {
      name: '2. С test=1 (тестовый режим)',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test order',
        amount: 100,
        currency: 'KGS',
        test: 1
      }
    },
    {
      name: '3. С long_term=0',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test order',
        amount: 100,
        currency: 'KGS',
        test: 1,
        long_term: 0
      }
    },
    {
      name: '4. С result_url',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test order',
        amount: 100,
        currency: 'KGS',
        test: 1,
        result_url: 'https://example.com/callback'
      }
    },
    {
      name: '5. С user_to (телефон)',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test order',
        amount: 100,
        currency: 'KGS',
        test: 1,
        user_to: '996555123456'
      }
    },
    {
      name: '6. Минимальная сумма (1 сом)',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test order',
        amount: 100,
        currency: 'KGS',
        test: 1
      }
    }
  ];

  for (const variation of variations) {
    console.log(`\n🧪 ${variation.name}`);
    console.log('-'.repeat(50));
    
    try {
      const requestData = createRequest('createInvoice', variation.data);
      console.log('📤 Отправляем запрос...');
      
      const response = await sendRequest(requestData);
      
      if (response.data && response.data.invoice_id) {
        console.log('✅ УСПЕХ! QR-код создан!');
        console.log('Invoice ID:', response.data.invoice_id);
        console.log('QR URL:', response.data.qr_url);
        console.log('EMV QR:', response.data.emv_qr);
        console.log('Link App:', response.data.link_app);
        return response.data;
      } else if (response.data && response.data.error) {
        console.log('❌ Ошибка:', response.data.desc);
        console.log('Код ошибки:', response.data.error);
      } else {
        console.log('❓ Неожиданный ответ:', response);
      }
    } catch (error) {
      console.error('💥 Ошибка:', error.message);
    }
    
    // Пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return null;
}

// Тест getOTP сначала
async function testGetOTP() {
  console.log('\n🧪 ТЕСТ: getOTP');
  console.log('-'.repeat(30));
  
  try {
    const requestData = createRequest('getOTP', { return_url: null });
    const response = await sendRequest(requestData);
    
    if (response.data && response.data.otp) {
      console.log('✅ OTP получен успешно');
      console.log('OTP:', response.data.otp);
      return response.data.otp;
    } else {
      console.log('❌ Ошибка получения OTP');
      if (response.data && response.data.error) {
        console.log('Код ошибки:', response.data.error);
        console.log('Описание:', response.data.desc);
      }
    }
  } catch (error) {
    console.error('💥 Ошибка getOTP:', error.message);
  }
  
  return null;
}

// Главная функция
async function runTests() {
  try {
    // Сначала попробуем getOTP
    const otp = await testGetOTP();
    
    // Затем тестируем различные варианты createInvoice
    const result = await testVariations();
    
    if (result) {
      console.log('\n🎉 QR-КОД УСПЕШНО СОЗДАН!');
      console.log('=' .repeat(50));
      console.log('🔗 QR-ссылки:');
      console.log('QR URL:', result.qr_url);
      console.log('EMV QR:', result.emv_qr);
      console.log('Link App:', result.link_app);
    } else {
      console.log('\n❌ Не удалось создать QR-код ни одним способом');
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
  }
}

// Запуск тестов
runTests();
