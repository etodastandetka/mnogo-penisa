const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Запуск HTTPS сервера...');

// Создаем самоподписанный сертификат
const createSelfSignedCert = () => {
  const certPath = path.join(__dirname, 'certs');
  const certFile = path.join(certPath, 'certificate.pem');
  const keyFile = path.join(certPath, 'private-key.pem');
  
  if (!fs.existsSync(certPath)) {
    fs.mkdirSync(certPath, { recursive: true });
  }
  
  if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
    console.log('🔐 Генерируем самоподписанный сертификат...');
    
    // Используем openssl для генерации сертификата
    const openssl = spawn('openssl', [
      'req', '-x509', '-newkey', 'rsa:4096', '-keyout', keyFile, '-out', certFile,
      '-days', '365', '-nodes', '-subj', '/C=RU/ST=Moscow/L=Moscow/O=MnogoRolly/CN=localhost'
    ], {
      stdio: 'inherit'
    });
    
    openssl.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Сертификат создан');
        startHttpsServer();
      } else {
        console.log('❌ Ошибка создания сертификата, запускаем HTTP');
        startHttpServer();
      }
    });
  } else {
    console.log('✅ Сертификат найден');
    startHttpsServer();
  }
};

const startHttpsServer = () => {
  try {
    const certPath = path.join(__dirname, 'certs');
    const certFile = path.join(certPath, 'certificate.pem');
    const keyFile = path.join(certPath, 'private-key.pem');
    
    const options = {
      cert: fs.readFileSync(certFile),
      key: fs.readFileSync(keyFile)
    };
    
    // Запускаем основной сервер на порту 3001
    const server = spawn('npx', ['ts-node', 'api/index.ts'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: '3001'
      }
    });
    
    // Создаем HTTPS сервер напрямую
    const httpsServer = https.createServer(options, (req, res) => {
      // Добавляем CORS заголовки
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Обрабатываем preflight запросы
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      // Проксируем запросы на HTTP сервер
      const proxyReq = http.request({
        hostname: '0.0.0.0',
        port: 3001,
        path: req.url,
        method: req.method,
        headers: req.headers
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      
      proxyReq.on('error', (err) => {
        console.log('❌ Ошибка прокси:', err.message);
        res.writeHead(500);
        res.end('Internal Server Error');
      });
      
      req.pipe(proxyReq);
    });
    
         httpsServer.listen(3444, '0.0.0.0', () => {
       console.log('🔒 HTTPS Server started on port: 3444');
       console.log('🌐 URL: https://45.144.221.227:3444');
      console.log('⚠️  Браузер может показать предупреждение о самоподписанном сертификате');
      console.log('📱 На телефоне нажмите "Продолжить" или "Доверять"');
    });
    
  } catch (error) {
    console.log('❌ Ошибка HTTPS сервера:', error.message);
    console.log('🔄 Запускаем HTTP сервер');
    startHttpServer();
  }
};

const startHttpServer = () => {
  console.log('🌐 Запускаем HTTP сервер...');
  const server = spawn('npx', ['ts-node', 'api/index.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '3001'
    }
  });
};

createSelfSignedCert();
