console.log('🧪 Простой тест O!Dengi API');

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

// Тест создания запроса
console.log('📝 Тестируем создание запроса...');

const mktime = Date.now().toString();
const requestData = {
  cmd: 'getOTP',
  version: config.version,
  sid: config.sid,
  mktime,
  lang: config.lang,
  data: { return_url: null }
};

const jsonString = createCompactJson(requestData);
const hash = createHash(jsonString, config.password);
requestData.hash = hash;

console.log('✅ Запрос создан:');
console.log(JSON.stringify(requestData, null, 2));

console.log('🔐 Подпись:', hash);
console.log('📏 Длина JSON:', jsonString.length);

console.log('🎉 Базовый тест пройден!');
