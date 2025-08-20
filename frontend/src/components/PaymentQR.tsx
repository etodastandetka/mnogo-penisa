import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  Upload,
  Camera,
  Receipt
} from 'lucide-react';
import { BankPaymentButtons } from './BankPaymentButtons';
import { uploadPaymentProof } from '../api/upload';

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
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    if (!selectedImage) return;
    
    setUploading(true);
    try {
      // Реальная загрузка файла на сервер
      const result = await uploadPaymentProof(selectedImage, order.id);
      
      if (result.success && result.fileUrl) {
        alert('Фото чека успешно загружено и привязано к заказу!');
        
        setShowPaymentProof(false);
        setSelectedImage(null);
        setImagePreview('');
        
        if (onPaymentComplete) {
          onPaymentComplete();
        }
      } else {
        throw new Error(result.error || 'Ошибка загрузки файла');
      }
    } catch (error) {
      alert(`Ошибка при загрузке фото чека: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-soft border-0 max-h-[90vh] overflow-hidden">
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
        {/* Новый интерфейс с кнопками всех банков */}
        <BankPaymentButtons
          amount={order.totalAmount}
          orderNumber={order.orderNumber || order.id}
          customerPhone={order.customerPhone}
          customerName={order.customerName}
        />

        {/* Кнопка "Я оплатил" */}
        <Button 
          onClick={() => setShowPaymentProof(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 mt-8"
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