import { client } from './client';

export interface TodayStats {
  total_orders: number;
  total_revenue: number;
  cash_revenue: number;
  card_revenue: number;
  date: string;
  startOfDay: string;
  endOfDay: string;
}

// Получить статистику заказов за сегодня
export const getTodayStats = async (): Promise<{ success: boolean; stats: TodayStats }> => {
  const response = await client.get('/admin/stats/today');
  return response.data;
};
