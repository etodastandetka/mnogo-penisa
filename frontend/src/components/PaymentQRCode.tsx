import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { QrCode, Check } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { ordersApi } from '../api/orders';
import { OrderStatus } from '../types';

interface PaymentQRCodeProps {
  orderId: string;
  amount: number;
  onPaymentComplete?: () => void;
}

// Банки и их ссылки (без эмодзи)
const banks = [
  {
    name: 'MBank',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  {
    name: 'Bakai Bank',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600'
  },
  {
    name: 'Demir Bank',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  },
  {
    name: 'Optima Bank',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600'
  },
  {
    name: 'MegaPay',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600'
  },
  {
    name: 'O! Bank',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600'
  },
  {
    name: 'Balance.kg',
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600'
  },
  {
    name: 'Companion',
    color: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600'
  }
];

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({ 
  orderId, 
  amount, 
  onPaymentComplete 
}) => {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Получаем QR-код с сервера
  React.useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const result = await ordersApi.getQrCode(orderId);
        setQrCodeUrl(result.qrCode);
      } catch (error) {
        // Fallback к простому QR-коду
        const qrData = `order:${orderId}|amount:${amount}|bank:${selectedBank || 'any'}`;
        setQrCodeUrl(`data:image/svg+xml;base64,${btoa(`
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="monospace" font-size="12" fill="black">${qrData}</text>
          </svg>
        `)}`);
      }
    };

    fetchQRCode();
  }, [orderId, amount, selectedBank]);



  const handleBankSelect = (bankName: string) => {
    setSelectedBank(bankName);
  };

  const handlePaymentComplete = async () => {
    try {
      // Отправляем статус оплаты на сервер
      await ordersApi.updateStatus(orderId, OrderStatus.DELIVERED);

      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error) {
      alert('Ошибка при обновлении статуса оплаты. Попробуйте еще раз.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-soft border-0">
        <CardContent className="p-6">
          {/* Заголовок */}
          <div className="text-center mb-6">
            <Badge variant="secondary" className="mb-4 bg-green-100 text-green-700 border-green-200">
              <QrCode className="w-4 h-4 mr-2" />
              Оплата заказа
            </Badge>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Заказ #{orderId}
            </h2>
            <p className="text-3xl font-bold text-red-600">
              {formatPrice(amount)}
            </p>
          </div>

          {/* QR-код */}
          <div className="text-center mb-6">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 inline-block">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-gray-400">Загрузка QR-кода...</div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Отсканируйте QR-код для оплаты
            </p>
          </div>



          {/* Банковские кнопки */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Выберите банк для оплаты
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {banks.map((bank) => (
                <Button
                  key={bank.name}
                  onClick={() => handleBankSelect(bank.name)}
                  className={`${bank.color} ${bank.hoverColor} text-white font-medium py-3 px-4 text-sm transition-all duration-200 ${
                    selectedBank === bank.name ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                >
                  {bank.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Кнопка завершения оплаты */}
          <Button
            onClick={handlePaymentComplete}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
          >
            <Check className="w-4 h-4 mr-2" />
            Оплата завершена
          </Button>

          {/* Инструкции */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">Инструкция по оплате:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Выберите ваш банк из списка выше</li>
              <li>2. Отсканируйте QR-код или скопируйте ссылку</li>
              <li>3. Введите сумму: {formatPrice(amount)}</li>
              <li>4. Подтвердите оплату в приложении банка</li>
              <li>5. Нажмите "Оплата завершена" после успешной оплаты</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};










