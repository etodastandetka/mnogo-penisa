import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { apiClient } from '../api/client';

interface FreedomPayCheckoutProps {
  totalAmount: number;
  orderId: number;
  onPaymentComplete: (paymentData: any) => void;
  onClose: () => void;
}

export const FreedomPayCheckout: React.FC<FreedomPayCheckoutProps> = ({
  totalAmount,
  orderId,
  onPaymentComplete,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/api/payments/freedompay/init', {
        orderId,
        amount: totalAmount,
        description: `Заказ #${orderId}`
      });

      if (response.data.success && response.data.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl);
        // Перенаправляем пользователя на страницу оплаты
        window.location.href = response.data.paymentUrl;
      } else {
        setError('Не удалось инициализировать платеж');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка инициализации платежа');
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayment = () => {
    // Для ручной оплаты (наличные, банковские переводы)
    onPaymentComplete({
      method: 'manual',
      amount: totalAmount,
      status: 'pending',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Оплата заказа #{orderId}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">Сумма к оплате:</p>
              <p className="text-3xl font-bold text-green-600">{totalAmount} сом</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={initializePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                {loading ? 'Инициализация...' : 'Оплатить картой онлайн'}
              </Button>

              <div className="text-center">
                <span className="text-gray-400">или</span>
              </div>

              <Button
                onClick={handleManualPayment}
                variant="outline"
                className="w-full py-3 text-lg"
              >
                Оплата наличными/переводом
              </Button>
            </div>

            <div className="text-sm text-gray-500 text-center">
              <p>Безопасная оплата через FreedomPay</p>
              <p>Поддерживаемые карты: Visa, MasterCard, UnionPay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
