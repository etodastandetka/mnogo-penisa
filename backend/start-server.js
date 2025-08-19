const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск Mnogo Rolly сервера...');
console.log('📁 Директория:', __dirname);
console.log('🔒 Порт: 3444');
console.log('🌐 URL: https://147.45.141.113:3444');

// Запускаем сервер
const server = spawn('node', ['api/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

server.on('error', (error) => {
  console.error('❌ Ошибка запуска сервера:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🔚 Сервер завершен с кодом: ${code}`);
  process.exit(code);
});

// Обработка сигналов для корректного завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT, завершаем сервер...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен сигнал SIGTERM, завершаем сервер...');
  server.kill('SIGTERM');
});
