import { apiClient } from './client';

export interface Shift {
  id: number;
  shift_number: string;
  opened_at: string;
  closed_at?: string;
  opened_by: number;
  closed_by?: number;
  total_orders: number;
  total_revenue: number;
  cash_revenue: number;
  card_revenue: number;
  status: 'open' | 'closed';
  notes?: string;
  opened_by_name?: string;
  closed_by_name?: string;
}

export const getCurrentShift = async (): Promise<{ success: boolean; shift: Shift | null }> => {
  try {
    const response = await apiClient.get('/shifts/current');
    return { success: true, shift: response.data };
  } catch (error: any) {
    console.error('❌ Ошибка получения текущей смены:', error);
    return { success: false, shift: null };
  }
};

export const openShift = async (notes?: string): Promise<{ success: boolean; shift: Shift }> => {
  try {
    const response = await apiClient.post('/shifts/open', { notes });
    return { success: true, shift: response.data };
  } catch (error: any) {
    console.error('❌ Ошибка открытия смены:', error);
    throw new Error(error.response?.data?.message || 'Ошибка открытия смены');
  }
};

export const closeShift = async (): Promise<{ success: boolean; message: string; shift: Shift }> => {
  try {
    const response = await apiClient.post('/shifts/close');
    return { success: true, message: 'Смена закрыта', shift: response.data };
  } catch (error: any) {
    console.error('❌ Ошибка закрытия смены:', error);
    throw new Error(error.response?.data?.message || 'Ошибка закрытия смены');
  }
};
