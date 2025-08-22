import { client } from './client';

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

// Получить текущую смену
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
