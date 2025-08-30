#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Создаем папку для логов если её нет
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const commands = {
  start: 'pm2 start ecosystem.config.js',
  stop: 'pm2 stop ecosystem.config.js',
  restart: 'pm2 restart ecosystem.config.js',
  reload: 'pm2 reload ecosystem.config.js',
  delete: 'pm2 delete ecosystem.config.js',
  status: 'pm2 status',
  logs: 'pm2 logs',
  monit: 'pm2 monit',
  startDev: 'pm2 start ecosystem.config.js --env development',
  startProd: 'pm2 start ecosystem.config.js --env production'
};

const action = process.argv[2] || 'status';

if (commands[action]) {
  try {
    console.log(`Выполняю команду: ${commands[action]}`);
    execSync(commands[action], { stdio: 'inherit' });
  } catch (error) {
    console.error(`Ошибка выполнения команды: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log('Доступные команды:');
  console.log('  start     - запустить все процессы');
  console.log('  stop      - остановить все процессы');
  console.log('  restart   - перезапустить все процессы');
  console.log('  reload    - перезагрузить все процессы (zero-downtime)');
  console.log('  delete    - удалить все процессы');
  console.log('  status    - показать статус процессов');
  console.log('  logs      - показать логи');
  console.log('  monit     - открыть мониторинг');
  console.log('  startDev  - запустить в режиме разработки');
  console.log('  startProd - запустить в продакшн режиме');
}

