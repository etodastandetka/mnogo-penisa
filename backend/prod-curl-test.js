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

// Создаем запрос для создания инвойса
const orderId = `prod_test_${Date.now()}`;
const requestData = createRequest('createInvoice', {
  order_id: orderId,
  desc: 'Продакшн тест заказ',
  amount: 1000, // 10 сом в копейках
  currency: 'KGS',
  test: 0 // Продакшн режим
});

console.log('🚀 CURL запрос для продакшн API O!Dengi');
console.log('=' .repeat(60));
console.log('');
console.log('📋 Конфигурация:');
console.log(`SID: ${config.sid}`);
console.log(`URL: ${config.serverUrl}`);
console.log(`Order ID: ${orderId}`);
console.log('');

console.log('🔧 CURL команда:');
console.log('curl -X POST https://api.dengi.o.kg/api/json/json.php \\');
console.log('  -H "Content-Type: application/json; charset=utf-8" \\');
console.log('  -d \'' + JSON.stringify(requestData, null, 2) + '\'');
console.log('');

console.log('📝 JSON для запроса:');
console.log(JSON.stringify(requestData, null, 2));
console.log('');

console.log('🔐 Подпись (hash):');
console.log(requestData.hash);
console.log('');

console.log('📏 Длина JSON строки:', createCompactJson(requestData).length);
console.log('');

console.log('⚠️  ВНИМАНИЕ: Это продакшн API!');
console.log('   - test: 0 означает реальные платежи');
console.log('   - Будьте осторожны с тестированием');
console.log('   - Рекомендуется сначала протестировать с минимальной суммой');
