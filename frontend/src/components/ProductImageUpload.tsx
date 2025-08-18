import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface ProductImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onClose: () => void;
  currentImageUrl?: string;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  onImageUpload,
  onClose,
  currentImageUrl
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // Функция для сжатия изображения
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Максимальные размеры для мобильных устройств
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Вычисляем новые размеры с сохранением пропорций
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Рисуем сжатое изображение
        ctx.drawImage(img, 0, 0, width, height);
        
        // Конвертируем в base64 с качеством 0.7 (70%)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Сжимаем изображение для предварительного просмотра
      compressImage(file).then((compressedUrl) => {
        setPreviewUrl(compressedUrl);
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        
        // Сжимаем изображение для предварительного просмотра
        compressImage(file).then((compressedUrl) => {
          setPreviewUrl(compressedUrl);
        });
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    try {
      console.log('Сжимаем изображение перед загрузкой:', selectedFile.name);
      
      // Сжимаем изображение перед отправкой
      const compressedBase64 = await compressImage(selectedFile);
      
      console.log('Размер сжатого изображения:', Math.round(compressedBase64.length / 1024), 'KB');
      
      // Отправляем сжатое base64 на сервер
      const response = await fetch('https://45.144.221.227:3444/api/upload-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: compressedBase64,
          filename: selectedFile.name
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Файл успешно загружен:', result.imageUrl);
        setUploaded(true);
        onImageUpload(result.imageUrl);
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error('Ошибка загрузки');
      }
      
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      alert('Ошибка при загрузке фото. Попробуйте еще раз.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  if (uploaded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
          <div className="text-green-500 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Фото успешно загружено! 🎉
          </h3>
          <p className="text-gray-600 mb-4">
            Фото товара добавлено в базу данных
          </p>
          <Button onClick={onClose} className="w-full">
            Закрыть
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Загрузка фото товара
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Drag & Drop зона */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                previewUrl 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-red-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="product-image-upload"
              />
              <label
                htmlFor="product-image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Предварительный просмотр"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                                         <p className="text-sm text-green-600 font-medium">
                       Файл выбран: {selectedFile?.name}
                     </p>
                     <p className="text-xs text-gray-500">
                       Размер: {Math.round((selectedFile?.size || 0) / 1024)} KB → Сжато для мобильных
                     </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Загрузите фото товара
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Перетащите файл сюда или нажмите для выбора
                    </p>
                                         <p className="text-xs text-gray-400">
                       Поддерживаемые форматы: JPG, PNG, GIF (автоматически сжимается)
                     </p>
                  </>
                )}
              </label>
            </div>

            {/* Кнопки действий */}
            <div className="flex space-x-3">
              {selectedFile && (
                <>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Загрузить фото
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={removeFile}
                    variant="outline"
                    className="px-6"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Отменить
                  </Button>
                </>
              )}
              
              <Button
                onClick={onClose}
                variant="outline"
                className="px-6"
              >
                Закрыть
              </Button>
            </div>

            {/* Текущее фото */}
            {currentImageUrl && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Текущее фото товара:
                </p>
                <img
                  src={`${currentImageUrl}?t=${Date.now()}`}
                  alt="Текущее фото"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
