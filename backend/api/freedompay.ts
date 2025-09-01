import crypto from 'crypto';
import axios from 'axios';

// Конфигурация FreedomPay
const FREEDOMPAY_CONFIG = {
  projectId: '560745',
  secretKey: 'ICfWiGtk83PSJRyk',
  secretKeyPayout: '7YAYjCE7qwVDm7cY',
  apiUrl: 'https://api.freedompay.kz',
  initPaymentUrl: 'https://api.freedompay.kz/init_payment.php',
  healthcheckUrl: 'https://api.freedompay.kz/status/healthcheck'
};

// Интерфейсы для типизации
interface PaymentInitRequest {
  pg_merchant_id: string;
  pg_amount: number;
  pg_order_id: string;
  pg_description: string;
  pg_salt: string;
  pg_sig: string;
  pg_currency: string;
  pg_lifetime: number;
  pg_success_url: string;
  pg_failure_url: string;
  pg_result_url: string;
  pg_check_url: string;
}

interface PaymentInitResponse {
  pg_status: string;
  pg_payment_id?: string;
  pg_redirect_url?: string;
  pg_error_code?: string;
  pg_error_description?: string;
}

interface PaymentResult {
  pg_order_id: string;
  pg_payment_id: string;
  pg_amount: number;
  pg_currency: string;
  pg_result: number;
  pg_salt: string;
  pg_sig: string;
}

// Класс для работы с FreedomPay API
export class FreedomPayService {
  private config = FREEDOMPAY_CONFIG;

  /**
   * Генерирует случайную соль для подписи
   */
  private generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Формирует подпись запроса согласно документации FreedomPay
   */
  private generateSignature(params: Record<string, any>): string {
    // Сортируем параметры по ключам
    const sortedParams = Object.keys(params).sort().reduce((result: Record<string, any>, key) => {
      result[key] = params[key];
      return result;
    }, {});

    // Формируем строку для подписи
    const signatureString = Object.values(sortedParams).join(';') + ';' + this.config.secretKey;
    
    // Возвращаем MD5 хеш
    return crypto.createHash('md5').update(signatureString).digest('hex');
  }

  /**
   * Проверяет подпись входящего запроса
   */
  private verifySignature(params: Record<string, any>, signature: string): boolean {
    const expectedSignature = this.generateSignature(params);
    return expectedSignature === signature;
  }

  /**
   * Инициализирует платеж
   */
  async initPayment(orderData: {
    orderId: string;
    amount: number;
    description: string;
    successUrl: string;
    failureUrl: string;
    resultUrl: string;
    checkUrl: string;
  }): Promise<PaymentInitResponse> {
    try {
      const salt = this.generateSalt();
      
      const requestParams: PaymentInitRequest = {
        pg_merchant_id: this.config.projectId,
        pg_amount: orderData.amount,
        pg_order_id: orderData.orderId,
        pg_description: orderData.description,
        pg_salt: salt,
        pg_currency: 'KGS',
        pg_lifetime: 3600, // 1 час
        pg_success_url: orderData.successUrl,
        pg_failure_url: orderData.failureUrl,
        pg_result_url: orderData.resultUrl,
        pg_check_url: orderData.checkUrl,
        pg_sig: '' // Будет заполнено ниже
      };

      // Генерируем подпись
      requestParams.pg_sig = this.generateSignature(requestParams);

      console.log('🚀 FreedomPay: Инициализация платежа', {
        orderId: orderData.orderId,
        amount: orderData.amount,
        description: orderData.description
      });

      // Отправляем запрос к FreedomPay
      const response = await axios.post(this.config.initPaymentUrl, requestParams, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000, // 30 секунд таймаут
      });

      console.log('✅ FreedomPay: Ответ на инициализацию', response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ FreedomPay: Ошибка инициализации платежа', error);
      throw new Error(`Ошибка инициализации платежа: ${error.message}`);
    }
  }

  /**
   * Проверяет статус сервиса FreedomPay
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(this.config.healthcheckUrl, {
        timeout: 10000, // 10 секунд таймаут
      });
      
      console.log('🏥 FreedomPay: Healthcheck успешен', response.status);
      return response.status === 200;
    } catch (error: any) {
      console.error('❌ FreedomPay: Healthcheck не прошел', error);
      return false;
    }
  }

  /**
   * Проверяет подпись входящего уведомления
   */
  verifyPaymentResult(params: Record<string, any>): boolean {
    try {
      const signature = params.pg_sig;
      if (!signature) {
        console.error('❌ FreedomPay: Отсутствует подпись в уведомлении');
        return false;
      }

      // Удаляем подпись из параметров для проверки
      const paramsForVerification = { ...params };
      delete paramsForVerification.pg_sig;

      const isValid = this.verifySignature(paramsForVerification, signature);
      
      if (isValid) {
        console.log('✅ FreedomPay: Подпись уведомления проверена успешно');
      } else {
        console.error('❌ FreedomPay: Неверная подпись уведомления');
      }

      return isValid;
    } catch (error: any) {
      console.error('❌ FreedomPay: Ошибка проверки подписи', error);
      return false;
    }
  }

  /**
   * Обрабатывает уведомление о результате платежа
   */
  processPaymentResult(params: Record<string, any>): {
    isValid: boolean;
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    isSuccess: boolean;
    errorCode?: string;
    errorDescription?: string;
  } {
    // Проверяем подпись
    if (!this.verifyPaymentResult(params)) {
      return {
        isValid: false,
        orderId: '',
        paymentId: '',
        amount: 0,
        currency: '',
        isSuccess: false,
        errorCode: 'INVALID_SIGNATURE',
        errorDescription: 'Неверная подпись уведомления'
      };
    }

    // Извлекаем данные
    const result = {
      isValid: true,
      orderId: params.pg_order_id || '',
      paymentId: params.pg_payment_id || '',
      amount: parseFloat(params.pg_amount) || 0,
      currency: params.pg_currency || 'KGS',
      isSuccess: params.pg_result === '1',
      errorCode: params.pg_error_code,
      errorDescription: params.pg_error_description
    };

    console.log('💰 FreedomPay: Обработка результата платежа', result);

    return result;
  }

  /**
   * Проверяет возможность приема платежа
   */
  async checkPaymentAvailability(orderId: string, amount: number): Promise<boolean> {
    try {
      // В реальной реализации здесь должна быть проверка через CHECK URL
      // Пока что возвращаем true для демонстрации
      console.log('🔍 FreedomPay: Проверка доступности платежа', { orderId, amount });
      return true;
    } catch (error: any) {
      console.error('❌ FreedomPay: Ошибка проверки доступности платежа', error);
      return false;
    }
  }
}

// Экспортируем экземпляр сервиса
export const freedomPayService = new FreedomPayService();
