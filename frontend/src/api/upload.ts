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

export const uploadPaymentProof = async (file: File, orderId: string | number, orderNumber: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('orderId', orderId.toString());
  formData.append('orderNumber', orderNumber);

  try {
    const response = await client.post('/orders/payment-proof', formData, {
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
