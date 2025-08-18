import { UploadResponse } from '../utils/fileUpload';

const API_BASE_URL = 'http://45.144.221.227:3001';

export const uploadFileToServer = async (
  file: File, 
  endpoint: string = '/api/upload'
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
    const response = await fetch(`${API_BASE_URL}/api/orders/payment-proof`, {
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

export const updateOrderPaymentProof = async (
  orderId: number, 
  fileUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/payment-proof`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ payment_proof: fileUrl })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Неизвестная ошибка обновления'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка обновления чека'
    };
  }
};
