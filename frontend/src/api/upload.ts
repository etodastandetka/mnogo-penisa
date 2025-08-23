import { client } from './client';
import { UploadResponse } from '../utils/fileUpload';

export const uploadFileToServer = async (
  file: File, 
  endpoint: string = '/upload'
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = response.data;
    
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

// Функция для конвертации файла в base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const updateOrderPaymentProof = async (
  orderId: number, 
  fileUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await client.patch(`/admin/orders/${orderId}/payment-proof`, {
      payment_proof: fileUrl
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка обновления'
    };
  }
};
