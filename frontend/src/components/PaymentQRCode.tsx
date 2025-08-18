import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { formatPrice } from '../utils/format';

interface PaymentQRCodeProps {
  order: {
    id: string | number;
    orderNumber?: string;
    totalAmount: number;
  };
  amount?: number;
  onPaymentComplete?: () => void;
  onClose?: () => void;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  order,
  amount,
  onPaymentComplete,
  onClose
}) => {
  const orderId = order.id;
  const payAmount = amount ?? order.totalAmount;

  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Генерируем простой QR код на клиенте без запроса к серверу
  React.useEffect(() => {
    const qrData = `order:${orderId}|amount:${payAmount}|bank:${selectedBank || 'any'}`;
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="monospace" font-size="12" fill="black">${qrData}</text>
      </svg>
    `;
    setQrCodeUrl(`data:image/svg+xml;base64,${btoa(svg)}`);
  }, [orderId, payAmount, selectedBank]);

  const handleBankSelect = (bankName: string) => {
    setSelectedBank(bankName);
  };

  const handlePayment = async () => {
    // Здесь могла бы быть внешняя оплата, но пока просто завершаем процесс
    if (onPaymentComplete) onPaymentComplete();
    if (onClose) onClose();
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-soft border-0">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Badge variant="secondary" className="mb-4 bg-green-100 text-green-700 border-green-200">
              <QrCode className="w-4 h-4 mr-2" />
              Оплата заказа
            </Badge>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Заказ #{orderId}
            </h2>
            <p className="text-3xl font-bold text-red-600">
              {formatPrice(payAmount)}
            </p>
          </div>

          <div className="text-center mb-6">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 inline-block">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 animate-pulse rounded" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handlePayment} className="w-full bg-green-600 hover:bg-green-700">
              Я оплатил(а)
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Закрыть
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};










