// Перевод категорий с английского на русский
export const getCategoryName = (category: string): string => {
  const categoryNames: { [key: string]: string } = {
    'rolls': 'Роллы',
    'pizza': 'Пицца',
    'sauces': 'Соусы',
    'drinks': 'Напитки',
    'sets': 'Сеты',
    'desserts': 'Десерты',
    'appetizers': 'Закуски'
  };
  return categoryNames[category] || category;
};

export const getCategoryEmoji = (category: string): string => {
  const categoryEmojis: { [key: string]: string } = {
    'rolls': '🍣',
    'pizza': '🍕',
    'sauces': '🥫',
    'drinks': '🥤',
    'sets': '🍱',
    'desserts': '🍰',
    'appetizers': '🥗'
  };
  return categoryEmojis[category] || '🍽️';
};

// Функция для сортировки категорий (роллы и пицца первыми)
export const getCategorySortOrder = (category: string): number => {
  const sortOrder: { [key: string]: number } = {
    'rolls': 1,
    'pizza': 2,
    'sets': 3,
    'appetizers': 4,
    'desserts': 5,
    'sauces': 6,
    'drinks': 7
  };
  return sortOrder[category] || 999;
};

// Функция для сортировки товаров по категориям
export const sortProductsByCategory = (products: any[]): any[] => {
  return products.sort((a, b) => {
    const orderA = getCategorySortOrder(a.category);
    const orderB = getCategorySortOrder(b.category);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Если категории одинаковые, сортируем по названию
    return a.name.localeCompare(b.name);
  });
};