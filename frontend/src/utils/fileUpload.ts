export interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export const uploadFile = async (
  file: File, 
  endpoint: string = '/api/upload'
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        fileUrl: result.fileUrl
      };
    } else {
      return {
        success: false,
        error: result.error || 'Неизвестная ошибка загрузки'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка загрузки файла'
    };
  }
};

export const uploadPaymentProof = async (file: File, orderId: string | number, orderNumber: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('orderId', orderId.toString());
  formData.append('orderNumber', orderNumber);

  try {
    const response = await fetch('http://45.144.221.227:3001/api/orders/payment-proof', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        fileUrl: result.fileUrl
      };
    } else {
      return {
        success: false,
        error: result.error || 'Неизвестная ошибка загрузки'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка загрузки файла'
    };
  }
};

export const generateFileName = (originalName: string, prefix: string = ''): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  
  return `${prefix}${timestamp}_${randomString}.${extension}`;
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Проверяем размер файла (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Файл слишком большой. Максимальный размер: ${(maxSize / 1024 / 1024).toFixed(1)}MB`
    };
  }

  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Пожалуйста, выберите изображение'
    };
  }

  // Проверяем расширение файла
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Неподдерживаемый формат файла. Разрешены: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
};
