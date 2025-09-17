import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { 
  QrCode, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface ODengiPaymentProps {
  orderId: string;
  amount: number;
  description?: string;
  customerPhone?: string;
  onPaymentComplete: (data: any) => void;
  onClose?: () => void;
}

interface PaymentStatus {
  status: 'pending' | 'paid' | 'cancelled' | 'error';
  message: string;
  transId?: string;
}

export const ODengiPayment: React.FC<ODengiPaymentProps> = ({
  orderId,
  amount,
  description,
  customerPhone,
  onPaymentComplete,
  onClose
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'pending',
    message: 'Ожидание создания QR-кода...'
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Создание QR-кода
  const createQRCode = async () => {
    setLoading(true);
    setError('');
    setPaymentStatus({
      status: 'pending',
      message: 'Создание QR-кода...'
    });

    try {
      const response = await fetch('/api/odengi/create-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          description: description || `Заказ #${orderId}`,
          customerPhone
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQrUrl(data.qrUrl);
        setInvoiceId(data.invoiceId);
        setPaymentStatus({
          status: 'pending',
          message: 'QR-код создан. Отсканируйте для оплаты.'
        });
      } else {
        setError(data.error || 'Ошибка создания QR-кода');
        setPaymentStatus({
          status: 'error',
          message: data.error || 'Ошибка создания QR-кода'
        });
      }
    } catch (error) {
      const errorMessage = 'Ошибка соединения с сервером';
      setError(errorMessage);
      setPaymentStatus({
        status: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Проверка статуса платежа
  const checkPaymentStatus = async () => {
    if (!invoiceId) return;

    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/odengi/status/${orderId}`);
      const data = await response.json();

      if (data.success) {
        if (data.status === 'paid') {
          setPaymentStatus({
            status: 'paid',
            message: 'Платеж успешно выполнен!',
            transId: data.transId
          });
          
          // Вызываем callback успешной оплаты
          setTimeout(() => {
            onPaymentComplete({
              orderId,
              paymentMethod: 'odengi_qr',
              amount: data.amount,
              transId: data.transId,
              invoiceId
            });
          }, 2000);
        } else {
          setPaymentStatus({
            status: 'pending',
            message: 'Ожидание оплаты...'
          });
        }
      } else {
        setPaymentStatus({
          status: 'error',
          message: data.error || 'Ошибка проверки статуса'
        });
      }
    } catch (error) {
      setPaymentStatus({
        status: 'error',
        message: 'Ошибка проверки статуса'
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Автоматическая проверка статуса каждые 5 секунд
  useEffect(() => {
    if (invoiceId && paymentStatus.status === 'pending') {
      const interval = setInterval(checkPaymentStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [invoiceId, paymentStatus.status]);

  // Создаем QR-код при монтировании компонента
  useEffect(() => {
    createQRCode();
  }, []);

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'paid':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <QrCode className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Оплата через O!Dengi
        </h2>
        <div className="text-sm text-gray-600">
          Заказ #{orderId} • {amount} сом
        </div>
      </div>

        {/* Статус платежа */}
        <div className={`p-4 rounded-lg border-2 mb-6 ${getStatusColor()}`}>
          <div className="flex items-center justify-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">{paymentStatus.message}</span>
          </div>
        </div>

        {/* QR-код */}
        {qrUrl && paymentStatus.status === 'pending' && (
          <div className="text-center">
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
              <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-800 mb-2">
                Отсканируйте QR-код в приложении O!Dengi
              </p>
              <p className="text-sm text-gray-600">
                Сумма: {amount} сом
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-medium text-green-800">
                  Инструкция по оплате
                </span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>1. Откройте приложение O!Dengi</p>
                <p>2. Нажмите "Оплатить по QR-коду"</p>
                <p>3. Отсканируйте QR-код выше</p>
                <p>4. Подтвердите платеж</p>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="space-y-3">
          {paymentStatus.status === 'pending' && (
            <Button
              onClick={checkPaymentStatus}
              disabled={isCheckingStatus || !invoiceId}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isCheckingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Проверка статуса...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Проверить оплату
                </>
              )}
            </Button>
          )}

          {paymentStatus.status === 'error' && (
            <Button
              onClick={createQRCode}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание QR-кода...
                </>
              ) : (
                'Попробовать снова'
              )}
            </Button>
          )}

          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Отмена
            </Button>
          )}
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Информация о заказе */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Информация о заказе
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Номер заказа:</strong> {orderId}</p>
            <p><strong>Сумма:</strong> {amount} сом</p>
            {customerPhone && (
              <p><strong>Телефон:</strong> {customerPhone}</p>
            )}
            {invoiceId && (
              <p><strong>ID инвойса:</strong> {invoiceId}</p>
            )}
          </div>
        </div>
    </div>
  );
};
