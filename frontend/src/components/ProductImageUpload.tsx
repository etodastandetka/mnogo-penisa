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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'product');

      console.log('Отправляем фото товара:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type
      });

      const response = await fetch(`http://localhost:3001/api/upload/product-image`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Фото товара успешно загружено:', result);
        setUploaded(true);
        onImageUpload(result.fileUrl);
        
        // Автоматически закрываем через 2 секунды
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error('Ошибка загрузки фото:', response.status, errorText);
        throw new Error(`Ошибка загрузки: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      alert('Ошибка загрузки фото. Попробуйте еще раз.');
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
                      Поддерживаемые форматы: JPG, PNG, GIF (макс. 5MB)
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
