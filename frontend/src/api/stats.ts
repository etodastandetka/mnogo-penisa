import { apiClient } from './client';

export interface TodayStats {
  total_orders: number;
  total_revenue: number;
  cash_revenue: number;
  card_revenue: number;
  date: string;
  startOfDay: string;
  endOfDay: string;
}

export const getTodayStats = async (): Promise<{ success: boolean; stats: TodayStats }> => {
  try {
    const response = await apiClient.get('/stats/today');
    return { success: true, stats: response.data };
  } catch (error: any) {
    console.error('❌ Ошибка получения статистики за день:', error);
    return { success: false, stats: response.data };
  }
};
