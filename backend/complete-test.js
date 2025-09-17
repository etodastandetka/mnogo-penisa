console.log('🚀 Полный тест O!Dengi API с OTP');
console.log('=' .repeat(60));

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
    console.log('Hash:', requestData.hash);
    
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

// Тест 1: getOTP
async function testGetOTP() {
  console.log('\n🧪 ТЕСТ 1: getOTP');
  console.log('-' .repeat(40));
  
  try {
    const requestData = createRequest('getOTP', { return_url: null });
    const response = await sendRequest(requestData);
    
    if (response.data && response.data.otp) {
      console.log('✅ OTP получен успешно');
      console.log('OTP:', response.data.otp);
      console.log('QR URL:', response.data.qr);
      return response.data.otp;
    } else {
      console.log('❌ Ошибка получения OTP');
      if (response.data && response.data.error) {
        console.log('Код ошибки:', response.data.error);
        console.log('Описание:', response.data.desc);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка теста getOTP:', error);
    return null;
  }
}

// Тест 2: createInvoice с OTP
async function testCreateInvoiceWithOTP(otp) {
  console.log('\n🧪 ТЕСТ 2: createInvoice с OTP');
  console.log('-' .repeat(40));
  
  try {
    const orderId = `test_${Date.now()}`;
    
    const requestData = createRequest('createInvoice', {
      order_id: orderId,
      desc: 'Test order with OTP',
      amount: 100, // 1 сом в копейках
      currency: 'KGS',
      test: 1,
      otp: otp // Добавляем OTP
    });
    
    const response = await sendRequest(requestData);
    
    if (response.data && response.data.invoice_id) {
      console.log('✅ Инвойс создан успешно!');
      console.log('Invoice ID:', response.data.invoice_id);
      console.log('QR URL:', response.data.qr_url);
      return {
        invoiceId: response.data.invoice_id,
        qrUrl: response.data.qr_url,
        orderId: response.data.order_id
      };
    } else {
      console.log('❌ Ошибка создания инвойса');
      if (response.data && response.data.error) {
        console.log('Код ошибки:', response.data.error);
        console.log('Описание:', response.data.desc);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка теста createInvoice:', error);
    return null;
  }
}

// Тест 3: createInvoice без OTP (попробуем разные параметры)
async function testCreateInvoiceVariations() {
  console.log('\n🧪 ТЕСТ 3: createInvoice - различные варианты');
  console.log('-' .repeat(40));
  
  const variations = [
    {
      name: 'Минимальные параметры',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test',
        amount: 100,
        currency: 'KGS',
        test: 1
      }
    },
    {
      name: 'С long_term',
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
      name: 'С result_url',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test order',
        amount: 100,
        currency: 'KGS',
        test: 1,
        result_url: 'https://example.com/callback'
      }
    }
  ];
  
  for (const variation of variations) {
    console.log(`\n🔍 Тестируем: ${variation.name}`);
    
    try {
      const requestData = createRequest('createInvoice', variation.data);
      const response = await sendRequest(requestData);
      
      if (response.data && response.data.invoice_id) {
        console.log('✅ Успех!');
        return {
          invoiceId: response.data.invoice_id,
          qrUrl: response.data.qr_url,
          orderId: response.data.order_id
        };
      } else {
        console.log('❌ Ошибка:', response.data?.desc || 'Неизвестная ошибка');
      }
    } catch (error) {
      console.error('❌ Ошибка:', error.message);
    }
  }
  
  return null;
}

// Главная функция
async function runAllTests() {
  try {
    // Тест 1: getOTP
    const otp = await testGetOTP();
    
    if (otp) {
      // Тест 2: createInvoice с OTP
      const invoice = await testCreateInvoiceWithOTP(otp);
      
      if (!invoice) {
        // Тест 3: Попробуем разные варианты без OTP
        await testCreateInvoiceVariations();
      }
    } else {
      // Если OTP не получили, попробуем создать инвойс без него
      await testCreateInvoiceVariations();
    }
    
    console.log('\n🎉 ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА:', error);
  }
}

// Запуск тестов
runAllTests();
