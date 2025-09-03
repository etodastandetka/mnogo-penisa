const crypto = require('crypto');

// Конфигурация QR-платежей по спецификации КР
const QR_PAYMENT_CONFIG = {
  // Банки КР
  banks: {
    'mbank': {
      name: 'МБанк',
      domain: 'c2b.mbank.kg',
      serviceCode: '1016',
      mcc: '5812' // Рестораны
    },
    'optima': {
      name: 'Оптима Банк',
      domain: 'qr.optimabank.kg', 
      serviceCode: '1017',
      mcc: '5812'
    },
    'kicb': {
      name: 'КИЦБ',
      domain: 'qr.kicb.kg',
      serviceCode: '1018', 
      mcc: '5812'
    },
    'demir': {
      name: 'Демир Банк',
      domain: 'qr.demirbank.kg',
      serviceCode: '1019',
      mcc: '5812'
    }
  },
  
  // Настройки по умолчанию
  defaults: {
    version: '01',
    paymentType: '12', // Динамический QR
    currency: '417', // Кыргызский сом
    merchantName: 'Mnogo rolly',
    allowAmountEdit: '11', // Разрешить изменение суммы
    allowIdEdit: '11' // Разрешить изменение ID
  }
};

class QRPaymentService {
  constructor() {
    this.config = QR_PAYMENT_CONFIG;
  }

  /**
   * Генерирует QR-код для оплаты по спецификации КР
   */
  generateQRCode(orderData, bankKey = 'mbank') {
    try {
      const bank = this.config.banks[bankKey];
      if (!bank) {
        throw new Error(`Банк ${bankKey} не найден`);
      }

      // Формируем детали платежа
      const paymentDetails = this.buildPaymentDetails(orderData, bank);
      
      // Генерируем контрольную сумму
      const checksum = this.generateChecksum(paymentDetails);
      
      // Добавляем контрольную сумму
      paymentDetails.push(`63${checksum.length.toString().padStart(2, '0')}${checksum}`);
      
      // Объединяем все детали
      const detailsString = paymentDetails.join('');
      
      // Формируем финальную ссылку
      const qrUrl = `https://pay.payqr.kg#${detailsString}`;
      
      console.log('🎯 QR-код сгенерирован:', {
        bank: bank.name,
        orderId: orderData.orderId,
        amount: orderData.amount,
        qrUrl: qrUrl.substring(0, 100) + '...'
      });

      return {
        success: true,
        qrUrl,
        bank: bank.name,
        orderId: orderData.orderId,
        amount: orderData.amount
      };
    } catch (error) {
      console.error('❌ Ошибка генерации QR-кода:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Формирует детали платежа согласно спецификации
   */
  buildPaymentDetails(orderData, bank) {
    const details = [];
    
    // 00 - Версия стандарта
    details.push(`00${this.config.defaults.version.length.toString().padStart(2, '0')}${this.config.defaults.version}`);
    
    // 01 - Тип платежной ссылки (динамический)
    details.push(`01${this.config.defaults.paymentType.length.toString().padStart(2, '0')}${this.config.defaults.paymentType}`);
    
    // 32 - Информация об услуге
    const serviceInfo = this.buildServiceInfo(orderData, bank);
    details.push(`32${serviceInfo.length.toString().padStart(2, '0')}${serviceInfo}`);
    
    // 52 - MCC код
    details.push(`52${bank.mcc.length.toString().padStart(2, '0')}${bank.mcc}`);
    
    // 53 - Код валюты
    details.push(`53${this.config.defaults.currency.length.toString().padStart(2, '0')}${this.config.defaults.currency}`);
    
    // 54 - Сумма платежа (в тыйнах)
    const amountInTiyin = Math.round(orderData.amount * 100);
    const amountStr = amountInTiyin.toString();
    details.push(`54${amountStr.length.toString().padStart(2, '0')}${amountStr}`);
    
    // 59 - Наименование поставщика услуг
    const merchantName = this.config.defaults.merchantName;
    details.push(`59${merchantName.length.toString().padStart(2, '0')}${merchantName}`);
    
    return details;
  }

  /**
   * Формирует информацию об услуге (ID 32)
   */
  buildServiceInfo(orderData, bank) {
    const serviceDetails = [];
    
    // 00 - Уникальный идентификатор (домен банка)
    serviceDetails.push(`00${bank.domain.length.toString().padStart(2, '0')}${bank.domain}`);
    
    // 01 - Код услуги в платежном шлюзе
    serviceDetails.push(`01${bank.serviceCode.length.toString().padStart(2, '0')}${bank.serviceCode}`);
    
    // 10 - ID плательщика (номер заказа)
    const payerId = orderData.orderId.toString();
    serviceDetails.push(`10${payerId.length.toString().padStart(2, '0')}${payerId}`);
    
    // 11 - ID транзакции
    const transactionId = `txn_${orderData.orderId}_${Date.now()}`;
    serviceDetails.push(`11${transactionId.length.toString().padStart(2, '0')}${transactionId}`);
    
    // 12 - Возможность редактирования суммы
    serviceDetails.push(`12${this.config.defaults.allowAmountEdit.length.toString().padStart(2, '0')}${this.config.defaults.allowAmountEdit}`);
    
    // 13 - Возможность редактирования ID плательщика
    serviceDetails.push(`13${this.config.defaults.allowIdEdit.length.toString().padStart(2, '0')}${this.config.defaults.allowIdEdit}`);
    
    return serviceDetails.join('');
  }

  /**
   * Генерирует контрольную сумму SHA256
   */
  generateChecksum(paymentDetails) {
    try {
      // Объединяем все детали кроме контрольной суммы
      const dataString = paymentDetails.join('');
      
      // Конвертируем в UTF-8 байты
      const dataBytes = Buffer.from(dataString, 'utf8');
      
      // Вычисляем SHA256
      const hash = crypto.createHash('sha256').update(dataBytes).digest('hex');
      
      // Убираем дефисы и берем последние 4 символа
      const cleanHash = hash.replace(/-/g, '');
      const checksum = cleanHash.slice(-4);
      
      console.log('🔐 Контрольная сумма сгенерирована:', checksum);
      
      return checksum;
    } catch (error) {
      console.error('❌ Ошибка генерации контрольной суммы:', error);
      throw error;
    }
  }

  /**
   * Получает список доступных банков
   */
  getAvailableBanks() {
    return Object.keys(this.config.banks).map(key => ({
      key,
      name: this.config.banks[key].name,
      domain: this.config.banks[key].domain
    }));
  }

  /**
   * Валидирует данные заказа
   */
  validateOrderData(orderData) {
    const errors = [];
    
    if (!orderData.orderId) {
      errors.push('Отсутствует ID заказа');
    }
    
    if (!orderData.amount || orderData.amount <= 0) {
      errors.push('Неверная сумма заказа');
    }
    
    if (orderData.amount > 1000000) { // Максимум 1 млн сом
      errors.push('Сумма превышает максимально допустимую');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = { QRPaymentService, qrPaymentService: new QRPaymentService() };
