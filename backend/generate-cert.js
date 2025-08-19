const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Генерация SSL сертификата...');

// Создаем папку для сертификатов если её нет
const certDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Генерируем приватный ключ
console.log('📝 Генерация приватного ключа...');
execSync('openssl genrsa -out certs/private-key.pem 2048', { stdio: 'inherit' });

// Создаем конфигурационный файл для сертификата
const configContent = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = KG
ST = Bishkek
L = Bishkek
O = Mnogo Rolly
OU = IT Department
CN = 89.169.44.75

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = 45.144.221.227
IP.1 = 45.144.221.227
`;

fs.writeFileSync(path.join(certDir, 'cert.conf'), configContent);

// Генерируем сертификат
console.log('🔑 Генерация сертификата...');
execSync('openssl req -new -x509 -key certs/private-key.pem -out certs/certificate.pem -days 365 -config certs/cert.conf', { stdio: 'inherit' });

console.log('✅ SSL сертификат создан успешно!');
console.log('📁 Файлы сохранены в папке: backend/certs/');
console.log('   - certificate.pem (сертификат)');
console.log('   - private-key.pem (приватный ключ)');
