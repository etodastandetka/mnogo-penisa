import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, X } from 'lucide-react';
import { getCurrentShift, Shift } from '../api/shifts';

export const ShiftStatusBanner: React.FC = () => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchShiftStatus = async () => {
      try {
        const response = await getCurrentShift();
        setCurrentShift(response.shift);
      } catch (error) {
        console.error('Ошибка загрузки статуса смены:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftStatus();
    
    // Проверяем статус каждые 5 минут
    const interval = setInterval(fetchShiftStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Если смена открыта или загрузка - не показываем баннер
  if (loading || currentShift) {
    return null;
  }

  // Если смена закрыта и баннер скрыт - не показываем
  if (!isVisible) {
    return null;
  }

  // Определяем время открытия следующей смены (например, завтра в 9:00)
  const getNextShiftTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  };

  const nextShiftTime = getNextShiftTime();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-200" />
            <div className="flex items-center space-x-2">
              <span className="font-medium">Внимание!</span>
              <span className="text-orange-100">
                Сейчас мы не принимаем заказы. Смена закрыта.
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-orange-100">
              <Clock className="w-4 h-4" />
              <span>
                Следующая смена: {nextShiftTime.toLocaleDateString('ru-RU')} в {nextShiftTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-orange-200 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
