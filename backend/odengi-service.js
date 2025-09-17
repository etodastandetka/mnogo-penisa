const crypto = require('crypto');

// Конфигурация O!Dengi API
const ODENGI_CONFIG = {
  version: 1005,
  sid: '5240752550', // Продакшн SID
  password: 'R^@OVPC|5@{64}G', // Продакшн пароль
  serverUrl: 'https://api.dengi.o.kg/api/json/json.php', // Продакшн URL
  lang: 'ru'
};

class ODengiService {
  constructor() {
    this.config = ODENGI_CONFIG;
  }

  // Создание HMAC-MD5 подписи
  createHash(jsonString, password = this.config.password) {
    return crypto.createHmac('md5', password).update(jsonString).digest('hex');
  }

  // Создание JSON без пробелов и переносов
  createCompactJson(obj) {
    return JSON.stringify(obj, null, '').replace(/\s+/g, '');
  }

  // Создание запроса
  createRequest(cmd, data) {
    const mktime = Date.now().toString();
    
    const requestData = {
      cmd,
      version: this.config.version,
      sid: this.config.sid,
      mktime,
      lang: this.config.lang,
      data
    };
    
    // Создаем JSON без подписи
    const jsonString = this.createCompactJson(requestData);
    
    // Создаем подпись
    const hash = this.createHash(jsonString);
    
    // Добавляем подпись к запросу
    requestData.hash = hash;
    
    return requestData;
  }

  // Отправка запроса
  async sendRequest(requestData) {
    try {
      console.log('📤 ODengi API запрос:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('📥 ODengi API ответ:', JSON.stringify(responseData, null, 2));
      
      return responseData;
    } catch (error) {
      console.error('❌ Ошибка ODengi API запроса:', error);
      throw error;
    }
  }

  // Создание инвойса для QR-оплаты
  async createInvoice(orderData) {
    try {
      const { orderId, amount, description, customerPhone, resultUrl } = orderData;
      
      const requestData = this.createRequest('createInvoice', {
        order_id: orderId,
        desc: description || `Заказ #${orderId}`,
        amount: Math.round(amount * 100), // Конвертируем в копейки
        currency: 'KGS',
        test: 1, // Тестовый режим
        long_term: 0, // Одноразовый счет
        user_to: customerPhone ? `996${customerPhone.replace(/\D/g, '')}` : undefined,
        result_url: resultUrl || `${process.env.BASE_URL || 'http://localhost:3000'}/api/odengi/callback`,
        send_push: customerPhone ? 1 : 0,
        send_sms: customerPhone ? 1 : 0
      });
      
      const response = await this.sendRequest(requestData);
      
      if (response.status === 'ok') {
        return {
          success: true,
          invoiceId: response.invoice_id,
          qrUrl: response.qr_url,
          orderId: response.order_id,
          amount: response.amount,
          currency: response.currency
        };
      } else {
        return {
          success: false,
          error: response.message || 'Неизвестная ошибка создания инвойса'
        };
      }
    } catch (error) {
      console.error('Ошибка создания инвойса ODengi:', error);
      return {
        success: false,
        error: error.message || 'Ошибка соединения с платежной системой'
      };
    }
  }

  // Проверка статуса платежа
  async checkPaymentStatus(invoiceId, orderId) {
    try {
      const requestData = this.createRequest('statusPayment', {
        invoice_id: invoiceId,
        order_id: orderId,
        mark: 0
      });
      
      const response = await this.sendRequest(requestData);
      
      if (response.status === 'ok') {
        return {
          success: true,
          status: response.status_pay,
          amount: response.amount,
          currency: response.currency,
          transId: response.trans_id,
          accountId: response.account_id,
          customerName: response.fname,
          customerPhone: response.mobile
        };
      } else {
        return {
          success: false,
          error: response.message || 'Ошибка получения статуса'
        };
      }
    } catch (error) {
      console.error('Ошибка проверки статуса ODengi:', error);
      return {
        success: false,
        error: error.message || 'Ошибка соединения с платежной системой'
      };
    }
  }

  // Отмена инвойса
  async cancelInvoice(invoiceId) {
    try {
      const requestData = this.createRequest('invoiceCancel', {
        invoice_id: invoiceId
      });
      
      const response = await this.sendRequest(requestData);
      
      if (response.status === 'ok') {
        return {
          success: true,
          message: 'Инвойс успешно отменен'
        };
      } else {
        return {
          success: false,
          error: response.message || 'Ошибка отмены инвойса'
        };
      }
    } catch (error) {
      console.error('Ошибка отмены инвойса ODengi:', error);
      return {
        success: false,
        error: error.message || 'Ошибка соединения с платежной системой'
      };
    }
  }

  // Проверка подписи callback'а
  verifyCallbackHash(response) {
    try {
      const hashString = `${response.trans_id}:::${response.status_pay}:::${response.site_id}:::${response.order_id}:::${response.amount}:::${response.currency}:::${response.mktime}:::${response.test}`;
      const calculatedHash = this.createHash(hashString);
      
      console.log('🔐 Проверка подписи callback:');
      console.log('Полученная подпись:', response.hash);
      console.log('Вычисленная подпись:', calculatedHash);
      
      return response.hash === calculatedHash;
    } catch (error) {
      console.error('Ошибка проверки подписи:', error);
      return false;
    }
  }

  // Обработка callback'а от O!Dengi
  processCallback(callbackData) {
    try {
      // Проверяем подпись
      if (!this.verifyCallbackHash(callbackData)) {
        console.error('❌ Неверная подпись callback');
        return {
          success: false,
          error: 'Неверная подпись'
        };
      }

      // Определяем статус платежа
      let paymentStatus;
      switch (callbackData.status_pay) {
        case 1:
          paymentStatus = 'pending';
          break;
        case 2:
          paymentStatus = 'cancelled';
          break;
        case 3:
          paymentStatus = 'paid';
          break;
        default:
          paymentStatus = 'unknown';
      }

      return {
        success: true,
        orderId: callbackData.order_id,
        transId: callbackData.trans_id,
        status: paymentStatus,
        amount: callbackData.amount / 100, // Конвертируем обратно в сомы
        currency: callbackData.currency,
        customerName: callbackData.fname,
        customerPhone: callbackData.mobile,
        accountId: callbackData.account_id,
        isTest: callbackData.test === 1
      };
    } catch (error) {
      console.error('Ошибка обработки callback:', error);
      return {
        success: false,
        error: error.message || 'Ошибка обработки уведомления'
      };
    }
  }
}

module.exports = new ODengiService();
