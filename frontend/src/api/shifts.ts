import { client } from './client';

export interface Shift {
  id: number;
  shift_number: string;
  opened_at: string;
  closed_at?: string;
  opened_by: number;
  closed_by?: number;
  opened_by_name?: string;
  closed_by_name?: string;
  total_orders: number;
  total_revenue: number;
  cash_revenue: number;
  card_revenue: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface ShiftDetail {
  shift: Shift;
  orders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    total_amount: number;
    payment_method: string;
    status: string;
    created_at: string;
  }>;
}

// Получить текущую открытую смену
export const getCurrentShift = async (): Promise<{ success: boolean; shift: Shift | null }> => {
  const response = await client.get('/admin/shifts/current');
  return response.data;
};

// Открыть новую смену
export const openShift = async (notes?: string): Promise<{ success: boolean; shift: Shift }> => {
  const response = await client.post('/admin/shifts/open', { notes });
  return response.data;
};

// Закрыть текущую смену
export const closeShift = async (): Promise<{ success: boolean; message: string; shift: Shift }> => {
  const response = await client.post('/admin/shifts/close');
  return response.data;
};

// Получить историю смен
export const getShiftsHistory = async (limit = 50, offset = 0): Promise<{ success: boolean; shifts: Shift[] }> => {
  const response = await client.get('/admin/shifts/history', {
    params: { limit, offset }
  });
  return response.data;
};

// Получить детали конкретной смены
export const getShiftDetails = async (id: number): Promise<{ success: boolean; shift: Shift; orders: any[] }> => {
  const response = await client.get(`/admin/shifts/${id}`);
  return response.data;
};
