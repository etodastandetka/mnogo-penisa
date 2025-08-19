const { spawn } = require('child_process');

console.log('🚀 Запуск сервера...');

// Запускаем основной сервер
const server = spawn('npx', ['ts-node', 'api/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '3001',
    NODE_ENV: 'production'
  }
});

server.on('error', (error) => {
  console.error('❌ Ошибка запуска сервера:', error);
});

server.on('close', (code) => {
  console.log(`🔴 Сервер остановлен с кодом: ${code}`);
});
