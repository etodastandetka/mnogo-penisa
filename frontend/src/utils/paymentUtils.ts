import CryptoJS from 'crypto-js';

interface PaymentData {
  amount: number; // сумма в сомах
  orderNumber: string;
  customerPhone?: string;
  customerName?: string;
}

// Генерируем базовый payload для всех банков
const generateBasePayload = (paymentData: PaymentData): string => {
  const { amount, orderNumber } = paymentData;
  
  // Конвертируем сумму в тыйны (1 сом = 100 тыйнов)
  const amountInTiyin = Math.round(amount * 100);
  
  // Формируем сумму как строку (например, 85000 -> "85000")
  const amountStr = amountInTiyin.toString();
  const amountLenStr = amountStr.length.toString().padStart(2, '0'); // "05" для 85000
  
  // Используем твою рабочую ссылку как шаблон и заменяем только сумму
  // Рабочая: 00020101021232890012c2b.mbank.kg010201101610305200303852221131QrKRbdrg6GYLuGskMRu2fDXp5aag1rA12021213021252049999530341754038005911Mnogo%20rolly63046524
  // Разбираем: 5403800 = 54 + 03 + 800 (где 03 = длина, 800 = 8 сом в тыйнах)
  // Заменяем 5403800 на 54{amountLenStr}{amountStr}
  
  const basePayload = "00020101021232890012c2b.mbank.kg010201101610305200303852221131QrKRbdrg6GYLuGskMRu2fDXp5aag1rA12021213021252049999530341754";
  const amountField = `${amountLenStr}${amountStr}`;
  const endPayload = "5911Mnogo rolly"; // ПРОБЕЛ, не %20
  
  // Формируем payload без контрольной суммы
  const payload = basePayload + amountField + endPayload;
  
  // Вычисляем контрольную сумму (SHA-256, последние 4 символа)
  const checksum = calculateChecksum(payload);
  
  // Формируем финальный payload
  const fullPayload = payload + "6304" + checksum;
  
  // В URL кодируем только пробелы
  const urlSafePayload = fullPayload.replace(" ", "%20");
  
  return urlSafePayload;
};

export const generateMBankQR = (paymentData: PaymentData): string => {
  const payload = generateBasePayload(paymentData);
  return `https://app.mbank.kg/qr#${payload}`;
};

// Функции для других банков
export const generateMegaPayQR = (paymentData: PaymentData): string => {
  const payload = generateBasePayload(paymentData);
  return `https://megapay.kg/get#${payload}`;
};

export const generateDengiQR = (paymentData: PaymentData): string => {
  const payload = generateBasePayload(paymentData);
  return `https://api.dengi.o.kg/ru/qr#${payload}`;
};

export const generateBalanceQR = (paymentData: PaymentData): string => {
  const payload = generateBasePayload(paymentData);
  return `https://balance.kg#${payload}`;
};

export const generateBakai24QR = (paymentData: PaymentData): string => {
  const payload = generateBasePayload(paymentData);
  return `https://bakai24.app#${payload}`;
};

export const generateDemirQR = (paymentData: PaymentData): string => {
  const payload = generateBasePayload(paymentData);
  return `https://retail.demirbank.kg#${payload}`;
};

export const generateOptimaQR = (paymentData: PaymentData): string => {
  const payload = generateBasePayload(paymentData);
  return `https://optimabank.kg/index.php?lang=ru#${payload}`;
};

export const generatePayQR = (paymentData: PaymentData): string => {
  const payload = generateBasePayload(paymentData);
  return `https://pay.payqr.kg#${payload}`;
};



const calculateChecksum = (dataString: string): string => {
  // 1. Преобразуем строку в UTF-8 байты
  const bytes = CryptoJS.enc.Utf8.parse(dataString);
  
  // 2. Вычисляем SHA-256 хеш
  const hash = CryptoJS.SHA256(bytes);
  
  // 3. Преобразуем в строку и убираем дефисы
  const hashString = hash.toString().replace(/-/g, '');
  
  // 4. Берем последние 4 символа
  return hashString.slice(-4);
};

// Функция для создания QR-кода с помощью библиотеки qrcode
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const QRCode = await import('qrcode');
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Ошибка генерации QR-кода:', error);
    throw error;
  }
};
