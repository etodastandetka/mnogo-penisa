console.log('🔍 Отладочный тест O!Dengi API');
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

// Проверяем пример из документации
console.log('📋 Проверяем пример из документации...');

const exampleData = {
  cmd: 'getOTP',
  version: 1005,
  sid: '1000000001',
  mktime: '1487602271287',
  lang: 'ru',
  data: { return_url: null }
};

const exampleJson = createCompactJson(exampleData);
const exampleHash = createHash(exampleJson, 'Z@(K0APS@B~MW1Q');

console.log('Пример JSON:', exampleJson);
console.log('Пример hash:', exampleHash);
console.log('Ожидаемый hash: 72d4a48dc7fe890af8beb00cd440c12d');
console.log('Совпадает:', exampleHash === '72d4a48dc7fe890af8beb00cd440c12d');

// Теперь наш запрос
console.log('\n📋 Проверяем наш запрос...');

const ourData = {
  cmd: 'getOTP',
  version: 1005,
  sid: '2310370542',
  mktime: '1758085460660',
  lang: 'ru',
  data: { return_url: null }
};

const ourJson = createCompactJson(ourData);
const ourHash = createHash(ourJson, config.password);

console.log('Наш JSON:', ourJson);
console.log('Наш hash:', ourHash);

// Проверяем createInvoice
console.log('\n📋 Проверяем createInvoice...');

const invoiceData = {
  cmd: 'createInvoice',
  version: 1005,
  sid: '2310370542',
  mktime: '1758085461788',
  lang: 'ru',
  data: {
    order_id: 'test_1758085461788',
    desc: 'Тестовый заказ O!Dengi',
    amount: 1000,
    currency: 'KGS',
    test: 1,
    long_term: 0
  }
};

const invoiceJson = createCompactJson(invoiceData);
const invoiceHash = createHash(invoiceJson, config.password);

console.log('Invoice JSON:', invoiceJson);
console.log('Invoice hash:', invoiceHash);

console.log('\n🎯 Проверяем длину строк...');
console.log('Example JSON length:', exampleJson.length);
console.log('Our JSON length:', ourJson.length);
console.log('Invoice JSON length:', invoiceJson.length);

console.log('\n✅ Отладка завершена!');
