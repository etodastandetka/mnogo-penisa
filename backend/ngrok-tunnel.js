const { spawn } = require('child_process');

console.log('🚀 Настройка ngrok туннеля для HTTPS...');

// Проверяем, установлен ли ngrok
const checkNgrok = () => {
  return new Promise((resolve) => {
    const check = spawn('ngrok', ['version'], { stdio: 'pipe' });
    check.on('close', (code) => {
      resolve(code === 0);
    });
  });
};

// Запускаем туннель
const startTunnel = async () => {
  const isInstalled = await checkNgrok();
  
  if (!isInstalled) {
    console.log('❌ ngrok не установлен');
    console.log('📥 Скачайте с: https://ngrok.com/download');
    console.log('🔑 Получите бесплатный токен на: https://dashboard.ngrok.com/get-started/your-authtoken');
    return;
  }
  
  console.log('✅ ngrok найден, запускаем туннель...');
  
  const tunnel = spawn('ngrok', [
    'http',
    '3001',
    '--log=stdout'
  ], {
    stdio: 'inherit'
  });
  
  tunnel.on('error', (error) => {
    console.error('❌ Ошибка туннеля:', error);
  });
  
  tunnel.on('close', (code) => {
    console.log(`🔴 Туннель остановлен с кодом: ${code}`);
  });
  
  console.log('🌐 HTTPS туннель запущен!');
  console.log('🔗 Проверьте URL в консоли ngrok');
};

startTunnel();




