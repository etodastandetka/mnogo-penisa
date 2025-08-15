import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  CreditCard,
  Clock,
  AlertCircle,
  Upload,
  Camera,
  Receipt
} from 'lucide-react';
import { 
  generateMBankQR, 
  generateMegaPayQR,
  generateDengiQR,
  generateBalanceQR,
  generateBakai24QR,
  generateDemirQR,
  generateOptimaQR,
  generatePayQR,
  generateQRCode 
} from '../utils/paymentUtils';

interface PaymentQRProps {
  order: any;
  onPaymentComplete?: () => void;
  onClose?: () => void;
}

export const PaymentQR: React.FC<PaymentQRProps> = ({ 
  order, 
  onPaymentComplete, 
  onClose 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generatePaymentQR();
  }, [order]);

  const generatePaymentQR = async () => {
    try {
      setLoading(true);
      setError('');

      // Генерируем QR-код для MBank
      const qrUrl = generateMBankQR({
        amount: order.totalAmount,
        orderNumber: order.orderNumber,
        customerPhone: order.customerPhone,
        customerName: order.customerName
      });

      setQrCodeUrl(qrUrl);

      // Генерируем изображение QR-кода
      const qrImage = await generateQRCode(qrUrl);
      setQrCodeDataUrl(qrImage);
    } catch (err) {
      setError('Ошибка генерации QR-кода');
      console.error('Ошибка генерации QR-кода:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  const openInMBank = () => {
    window.open(qrCodeUrl, '_blank');
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      setSelectedImage(file);

      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentProof = async () => {
    if (!selectedImage) {
      alert('Пожалуйста, выберите фото чека');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', selectedImage);
      formData.append('orderId', (order.id || order.orderNumber).toString());

      console.log('Отправка фото чека для заказа:', order.id || order.orderNumber);

      const response = await fetch('http://localhost:3001/api/orders/payment-proof', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Фото чека успешно загружено!');
        setShowPaymentProof(false);
        setSelectedImage(null);
        setImagePreview('');
        if (onPaymentComplete) {
          onPaymentComplete();
        }
      } else {
        const errorData = await response.json();
        alert(`Ошибка загрузки: ${errorData.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка отправки чека:', error);
      alert('Ошибка отправки фото чека. Попробуйте еще раз.');
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <Card className="max-w-md mx-auto shadow-soft border-0 max-h-[90vh] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Генерация QR-кода...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto shadow-soft border-0 max-h-[90vh] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <span className="text-red-600">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto shadow-soft border-0 max-h-[90vh] overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Оплата заказа</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="primary" className="bg-red-600 text-white">
            Заказ #{order.orderNumber || order.id}
          </Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {order.totalAmount} сом
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        {/* QR-код */}
        <div className="text-center mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block mb-4">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR-код для оплаты"
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Скопировано' : 'Скопировать ссылку'}
            </Button>
            
            <Button
              onClick={openInMBank}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Открыть в MBank
            </Button>
          </div>
        </div>

        {/* Другие способы оплаты */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Другие способы оплаты</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => window.open(generateMegaPayQR({
                amount: order.totalAmount,
                orderNumber: order.orderNumber,
                customerPhone: order.customerPhone,
                customerName: order.customerName
              }), '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
            >
              MegaPay
            </Button>
            
            <Button 
              onClick={() => window.open(generateDengiQR({
                amount: order.totalAmount,
                orderNumber: order.orderNumber,
                customerPhone: order.customerPhone,
                customerName: order.customerName
              }), '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white text-sm py-2"
            >
              O! Деньги
            </Button>
            
            <Button 
              onClick={() => window.open(generateBalanceQR({
                amount: order.totalAmount,
                orderNumber: order.orderNumber,
                customerPhone: order.customerPhone,
                customerName: order.customerName
              }), '_blank')}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-2"
            >
              Balance.kg
            </Button>
            
            <Button 
              onClick={() => window.open(generateBakai24QR({
                amount: order.totalAmount,
                orderNumber: order.orderNumber,
                customerPhone: order.customerPhone,
                customerName: order.customerName
              }), '_blank')}
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm py-2"
            >
              Bakai24
            </Button>
            
            <Button 
              onClick={() => window.open(generateDemirQR({
                amount: order.totalAmount,
                orderNumber: order.orderNumber,
                customerPhone: order.customerPhone,
                customerName: order.customerName
              }), '_blank')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2"
            >
              Demir Bank
            </Button>
            
            <Button 
              onClick={() => window.open(generateOptimaQR({
                amount: order.totalAmount,
                orderNumber: order.orderNumber,
                customerPhone: order.customerPhone,
                customerName: order.customerName
              }), '_blank')}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm py-2"
            >
              Optima Bank
            </Button>
            
            <Button 
              onClick={() => window.open(generatePayQR({
                amount: order.totalAmount,
                orderNumber: order.orderNumber,
                customerPhone: order.customerPhone,
                customerName: order.customerName
              }), '_blank')}
              className="bg-pink-600 hover:bg-pink-700 text-white text-sm py-2"
            >
              PayQR
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowPaymentProof(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 mt-4"
        >
          <Receipt className="w-4 h-4" />
          Я оплатил
        </Button>

        {/* Загрузка фото чека */}
        {showPaymentProof && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Загрузите фото чека</h3>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <Button
                onClick={openFileDialog}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Выбрать фото из галереи
              </Button>
              
              {imagePreview && (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Превью чека"
                    className="w-full rounded-lg border border-gray-300"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePaymentProof}
                      disabled={uploading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Отправить
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                        setShowPaymentProof(false);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Информация о заказе */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Информация о заказе</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Номер заказа:</strong> {order.orderNumber || order.id}</p>
            <p><strong>Сумма:</strong> {order.totalAmount} сом</p>
            <p><strong>Клиент:</strong> {order.customerName || 'Гость'}</p>
            <p><strong>Телефон:</strong> {order.customerPhone || 'Не указан'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};