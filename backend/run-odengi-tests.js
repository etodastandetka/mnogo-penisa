#!/usr/bin/env node

const { runAllTests } = require('./test-odengi-api');

console.log('🚀 Запуск тестирования O!Dengi API...\n');

// Запускаем все тесты
runAllTests().then(() => {
  console.log('\n✅ Тестирование завершено!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Критическая ошибка:', error);
  process.exit(1);
});
