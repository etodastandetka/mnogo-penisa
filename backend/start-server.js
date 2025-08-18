const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск Mnogo Rolly сервера...');

// Запускаем TypeScript сервер
const server = spawn('npx', ['ts-node', 'api/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '3001'
  }
});

server.on('error', (error) => {
  console.error('❌ Ошибка запуска сервера:', error);
});

server.on('close', (code) => {
  console.log(`🔴 Сервер остановлен с кодом: ${code}`);
});

// Обработка сигналов для корректного завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT, останавливаем сервер...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен сигнал SIGTERM, останавливаем сервер...');
  server.kill('SIGTERM');
});
