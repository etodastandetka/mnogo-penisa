import { apiClient } from './client';

export interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export const uploadFileToServer = async (
  file: File, 
  endpoint: string = '/upload'
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка загрузки файла:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Ошибка загрузки файла'
    };
  }
};

export const updateOrderPaymentProof = async (
  orderId: number, 
  fileUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.post(`/orders/${orderId}/payment-proof`, {
      paymentProof: fileUrl
    });
    return { success: true };
  } catch (error: any) {
    console.error('❌ Ошибка обновления подтверждения оплаты:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Ошибка обновления подтверждения'
    };
  }
};
