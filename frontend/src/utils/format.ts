// Форматирование цены
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price) + ' сом';
};

// Форматирование даты
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Форматирование времени
export const formatTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Получение статуса заказа в текстовом виде
export const getOrderStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Принят';
    case 1:
      return 'Готовится';
    case 2:
      return 'В доставке';
    case 3:
      return 'Доставлен';
    default:
      return 'Неизвестно';
  }
};

// Получение цвета статуса
export const getOrderStatusColor = (status: number): string => {
  switch (status) {
    case 0:
      return 'text-warning-600 bg-warning-50';
    case 1:
      return 'text-primary-600 bg-primary-50';
    case 2:
      return 'text-secondary-600 bg-secondary-50';
    case 3:
      return 'text-success-600 bg-success-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

