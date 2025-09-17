console.log('🔐 Тестирование продакшн API с OTP');
console.log('=' .repeat(50));

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

// Получение OTP
async function getOTP() {
  console.log('🔑 Получаем OTP...');
  
  try {
    const requestData = createRequest('getOTP', { return_url: null });
    const response = await sendRequest(requestData);
    
    if (response.data && response.data.otp) {
      console.log('✅ OTP получен:', response.data.otp);
      return response.data.otp;
    } else {
      console.log('❌ Ошибка получения OTP');
      return null;
    }
  } catch (error) {
    console.error('💥 Ошибка getOTP:', error.message);
    return null;
  }
}

// Создание инвойса с OTP
async function createInvoiceWithOTP(otp) {
  console.log('\n💰 Создаем инвойс с OTP...');
  
  try {
    const orderId = `prod_otp_${Date.now()}`;
    
    const requestData = createRequest('createInvoice', {
      order_id: orderId,
      desc: 'Тест с OTP',
      amount: 100, // 1 сом
      currency: 'KGS',
      test: 1, // Тестовый режим
      otp: otp // Добавляем OTP
    });
    
    console.log('📤 Отправляем запрос с OTP...');
    const response = await sendRequest(requestData);
    
    if (response.data && response.data.invoice_id) {
      console.log('🎉 УСПЕХ! QR-код создан с OTP!');
      console.log('Invoice ID:', response.data.invoice_id);
      console.log('QR URL:', response.data.qr_url);
      console.log('EMV QR:', response.data.emv_qr);
      return response.data;
    } else {
      console.log('❌ Ошибка создания инвойса с OTP');
      if (response.data && response.data.error) {
        console.log('Код ошибки:', response.data.error);
        console.log('Описание:', response.data.desc);
      }
      return null;
    }
  } catch (error) {
    console.error('💥 Ошибка createInvoice:', error.message);
    return null;
  }
}

// Попробуем разные варианты с OTP
async function testDifferentOTPVariations(otp) {
  const variations = [
    {
      name: 'С OTP и test=1',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test with OTP',
        amount: 100,
        currency: 'KGS',
        test: 1,
        otp: otp
      }
    },
    {
      name: 'С OTP и test=0 (продакшн)',
      data: {
        order_id: `prod_${Date.now()}`,
        desc: 'Production with OTP',
        amount: 100,
        currency: 'KGS',
        test: 0,
        otp: otp
      }
    },
    {
      name: 'С OTP и long_term=0',
      data: {
        order_id: `test_${Date.now()}`,
        desc: 'Test with OTP and long_term',
        amount: 100,
        currency: 'KGS',
        test: 1,
        long_term: 0,
        otp: otp
      }
    }
  ];

  for (const variation of variations) {
    console.log(`\n🧪 ${variation.name}`);
    console.log('-'.repeat(40));
    
    try {
      const requestData = createRequest('createInvoice', variation.data);
      const response = await sendRequest(requestData);
      
      if (response.data && response.data.invoice_id) {
        console.log('✅ УСПЕХ!');
        console.log('Invoice ID:', response.data.invoice_id);
        console.log('QR URL:', response.data.qr_url);
        return response.data;
      } else {
        console.log('❌ Ошибка:', response.data?.desc || 'Неизвестная ошибка');
      }
    } catch (error) {
      console.error('💥 Ошибка:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return null;
}

// Главная функция
async function main() {
  try {
    // Получаем OTP
    const otp = await getOTP();
    
    if (!otp) {
      console.log('❌ Не удалось получить OTP, завершаем');
      return;
    }
    
    // Пробуем создать инвойс с OTP
    const result = await createInvoiceWithOTP(otp);
    
    if (!result) {
      // Если не получилось, пробуем разные варианты
      console.log('\n🔄 Пробуем разные варианты с OTP...');
      await testDifferentOTPVariations(otp);
    } else {
      console.log('\n🎉 QR-КОД УСПЕШНО СОЗДАН!');
      console.log('=' .repeat(50));
      console.log('🔗 QR-ссылки:');
      console.log('QR URL:', result.qr_url);
      console.log('EMV QR:', result.emv_qr);
      console.log('Link App:', result.link_app);
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
  }
}

// Запуск
main();
