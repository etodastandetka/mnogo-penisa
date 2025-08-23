const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск Mnogo Rolly HTTP сервера...');
console.log('📁 Директория:', __dirname);
console.log('🌐 Порт: 3001');
console.log('🌐 URL: http://147.45.141.113:3001');

// Запускаем HTTP сервер на порту 3001
const server = spawn('npx', ['ts-node', 'api/index-http.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production', HTTP_ONLY: 'true' }
});

server.on('error', (error) => {
  console.error('❌ Ошибка запуска HTTP сервера:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🔚 HTTP сервер завершен с кодом: ${code}`);
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
