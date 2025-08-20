// Перевод категорий с английского на русский
export const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    // Английские категории
    'rolls': 'Роллы',
    'pizza': 'Пицца', 
    'wings': 'Крылышки',
    'snacks': 'Снэки',
    'sauces': 'Соусы',
    'drinks': 'Напитки',
    'sets': 'Сеты',
    // Русские категории (уже переведенные)
    'Роллы': 'Роллы',
    'Сашими': 'Сашими',
    'Сеты': 'Сеты', 
    'Супы': 'Супы'
  };

  return categoryMap[category] || category;
};

// Получение эмодзи для категории
export const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    // Английские категории
    'rolls': '🍣',
    'pizza': '🍕',
    'wings': '🍗',
    'snacks': '🍟',
    'sauces': '🥫',
    'drinks': '🥤',
    'sets': '🍱',
    // Русские категории
    'Роллы': '🍣',
    'Сашими': '🍣',
    'Сеты': '🍱',
    'Супы': '🍲'
  };

  return emojiMap[category] || '🍽️';
};