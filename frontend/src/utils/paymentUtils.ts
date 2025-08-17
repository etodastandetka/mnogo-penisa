// Простая функция для генерации ссылок на банки
export const generateBankLinks = (amount: number, transactionId: string) => {
  // Ваш хеш для всех банков
  const qrHash = "00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a";
  
  const banks = {
    dengi: {
      name: "О деньги",
      url: "https://api.dengi.o.kg/ru/qr/"
    },
    bakai: {
      name: "Bakai",
      url: "https://bakai24.app/"
    },
    balance: {
      name: "Balance.kg",
      url: "https://balance.kg/"
    },
    megapay: {
      name: "Mega",
      url: "https://megapay.kg/get"
    },
    mbank: {
      name: "Mbank",
      url: "https://app.mbank.kg/qr/"
    },
    demirbank: {
      name: "Demirbank",
      url: "https://retail.demirbank.kg/"
    },
    companion: {
      name: "Companion",
      url: "https://payqr.kg/qr/"
    }
  };
  
  const bankLinks: Record<string, any> = {};
  
  // Каждый банк получает прямую ссылку с вашим хешем
  for (const [bankCode, bankInfo] of Object.entries(banks)) {
    bankLinks[bankCode] = {
      name: bankInfo.name,
      url: bankInfo.url,
      fullLink: `${bankInfo.url}${qrHash}`
    };
  }
  
  return bankLinks;
};





// Функция для проверки валидности QR-хэша
export const validateQRHash = (qrHash: string): boolean => {
  try {
    // Проверяем базовую структуру
    if (!qrHash.startsWith('000201')) {
      return false;
    }
    
    // Проверяем наличие обязательных полей
    const requiredFields = ['54', '59', '63'];
    for (const field of requiredFields) {
      if (!qrHash.includes(field)) {
        return false;
      }
    }
    
    // Проверяем контрольную сумму
    const checksumMatch = qrHash.match(/6304([A-Fa-f0-9]{4})$/);
    if (!checksumMatch) {
      return false;
    }
    
    // Проверяем, что контрольная сумма имеет правильную длину
    const checksum = checksumMatch[1];
    if (checksum.length !== 4) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
};

// Функция для форматирования суммы для отображения
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KGS',
    minimumFractionDigits: 2
  }).format(amount);
};

// Функция для генерации уникального ID транзакции
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `tx_${timestamp}_${random}`;
};
