const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Настройка Cloudflare Tunnel для HTTPS...');

// Проверяем, установлен ли cloudflared
const checkCloudflared = () => {
  return new Promise((resolve) => {
    const check = spawn('cloudflared', ['--version'], { stdio: 'pipe' });
    check.on('close', (code) => {
      resolve(code === 0);
    });
  });
};

// Запускаем туннель
const startTunnel = async () => {
  const isInstalled = await checkCloudflared();
  
  if (!isInstalled) {
    console.log('❌ Cloudflared не установлен');
    console.log('📥 Установите с: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
    return;
  }
  
  console.log('✅ Cloudflared найден, запускаем туннель...');
  
  const tunnel = spawn('cloudflared', [
    'tunnel',
    '--url', 'http://localhost:3001',
    '--hostname', 'mnogo-rolly.your-domain.com' // Замените на ваш домен
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
  console.log('🔗 URL: https://mnogo-rolly.your-domain.com');
};

startTunnel();
