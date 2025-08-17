import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Star } from 'lucide-react';

interface Review {
  name: string;
  rating: number;
  text: string;
  avatar: string;
}

const allReviews: Review[] = [
  // Кыргызские имена и отзывы
  {
    name: 'Айгерим Токтобекова',
    rating: 5,
    text: 'Заказываю уже третий раз! Быстрая доставка, отличный сервис. Роллы всегда свежие и вкусные.',
    avatar: 'АТ'
  },
  {
    name: 'Айнура Абдыкадырова',
    rating: 5,
    text: 'Невероятно вкусные роллы! Доставили за 25 минут, все было свежим и горячим. Обязательно закажу еще!',
    avatar: 'АА'
  },
  {
    name: 'Бермет Кыдырова',
    rating: 5,
    text: 'Лучшие роллы в городе! Качество на высоте, порции большие. Рекомендую всем любителям японской кухни.',
    avatar: 'БК'
  },
  {
    name: 'Гульнара Асанова',
    rating: 4,
    text: 'Очень вкусно! Заказываю для всей семьи, все довольны. Особенно любят дети роллы с лососем.',
    avatar: 'ГА'
  },
  {
    name: 'Динара Мамытова',
    rating: 5,
    text: 'Отличный сервис! Роллы всегда свежие, доставка быстрая. Цены приемлемые для такого качества.',
    avatar: 'ДМ'
  },
  {
    name: 'Эльмира Садыкова',
    rating: 4,
    text: 'Заказываю регулярно, никогда не подводили. Роллы вкусные, ингредиенты свежие. Спасибо!',
    avatar: 'ЭС'
  },
  {
    name: 'Жанара Бекешова',
    rating: 5,
    text: 'Первый раз заказала, очень довольна! Быстрая доставка, вкусные роллы. Буду заказывать еще.',
    avatar: 'ЖБ'
  },
  {
    name: 'Кундуз Орозбекова',
    rating: 4,
    text: 'Отличные роллы! Заказываю для офиса, коллеги в восторге. Быстрая доставка и хорошие цены.',
    avatar: 'КО'
  },
  {
    name: 'Лейла Исмаилова',
    rating: 5,
    text: 'Лучший сервис доставки роллов! Всегда свежие, вкусные и красиво упакованные. Рекомендую!',
    avatar: 'ЛИ'
  },
  {
    name: 'Мээрим Усубалиева',
    rating: 4,
    text: 'Заказываю уже месяц, очень довольна качеством. Роллы всегда свежие, доставка быстрая.',
    avatar: 'МУ'
  },
  // Русские имена и отзывы
  {
    name: 'Михаил Соколов',
    rating: 4,
    text: 'Лучшие роллы в городе! Качество на высоте, порции большие. Рекомендую всем любителям японской кухни.',
    avatar: 'МС'
  },
  {
    name: 'Анна Петрова',
    rating: 5,
    text: 'Невероятно вкусные роллы! Доставили за 30 минут, все было свежим. Обязательно закажу еще!',
    avatar: 'АП'
  },
  {
    name: 'Дмитрий Иванов',
    rating: 4,
    text: 'Отличный сервис! Заказываю для всей семьи, все довольны. Особенно любят дети роллы с креветкой.',
    avatar: 'ДИ'
  },
  {
    name: 'Елена Сидорова',
    rating: 5,
    text: 'Лучший сервис доставки роллов! Всегда свежие, вкусные и красиво упакованные. Рекомендую всем!',
    avatar: 'ЕС'
  },
  {
    name: 'Александр Козлов',
    rating: 4,
    text: 'Заказываю регулярно, никогда не подводили. Роллы вкусные, ингредиенты свежие. Спасибо за качество!',
    avatar: 'АК'
  },
  {
    name: 'Мария Новикова',
    rating: 5,
    text: 'Первый раз заказала, очень довольна! Быстрая доставка, вкусные роллы. Буду заказывать еще.',
    avatar: 'МН'
  },
  {
    name: 'Сергей Морозов',
    rating: 4,
    text: 'Отличные роллы! Заказываю для офиса, коллеги в восторге. Быстрая доставка и хорошие цены.',
    avatar: 'СМ'
  },
  {
    name: 'Ольга Волкова',
    rating: 5,
    text: 'Заказываю уже третий раз! Быстрая доставка, отличный сервис. Роллы всегда свежие и вкусные.',
    avatar: 'ОВ'
  },
  {
    name: 'Владимир Соловьев',
    rating: 4,
    text: 'Лучшие роллы в городе! Качество на высоте, порции большие. Рекомендую всем любителям японской кухни.',
    avatar: 'ВС'
  },
  {
    name: 'Татьяна Лебедева',
    rating: 5,
    text: 'Невероятно вкусные роллы! Доставили за 25 минут, все было свежим и горячим. Обязательно закажу еще!',
    avatar: 'ТЛ'
  }
];

interface DynamicReviewsProps {
  variant?: 'default' | 'hero';
}

export const DynamicReviews: React.FC<DynamicReviewsProps> = ({ variant = 'default' }) => {
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Выбираем случайные 3 отзыва из всех 20
    const shuffled = [...allReviews].sort(() => 0.5 - Math.random());
    setDisplayedReviews(shuffled.slice(0, 3));
  }, []);

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-orange-500',
      'bg-red-500',
      'bg-orange-600',
      'bg-red-600',
      'bg-orange-400',
      'bg-red-400',
      'bg-orange-700',
      'bg-red-700'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (variant === 'hero') {
    return (
      <div className="space-y-3">
        {displayedReviews.map((review, index) => (
          <div 
            key={index} 
            className="bg-orange-200/30 backdrop-blur-sm rounded-xl p-3 border border-orange-300/5 shadow-soft"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${getAvatarColor(review.name)} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {review.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{review.name}</h4>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                    ))}
                    {[...Array(5 - review.rating)].map((_, i) => (
                      <Star key={i + review.rating} className="w-3 h-3 text-gray-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-800 text-xs leading-relaxed">"{review.text}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {displayedReviews.map((review, index) => (
        <Card 
          key={index} 
          className="border-0 shadow-soft text-center hover:shadow-lg transition-shadow bg-white"
        >
          <CardContent className="p-8">
            <div className={`w-16 h-16 ${getAvatarColor(review.name)} rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg`}>
              {review.avatar}
            </div>
            <div className="flex justify-center mb-4">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
              {[...Array(5 - review.rating)].map((_, i) => (
                <Star key={i + review.rating} className="w-5 h-5 text-gray-300" />
              ))}
            </div>
            <p className="text-gray-600 mb-4 italic">"{review.text}"</p>
            <h4 className="font-semibold text-gray-900">{review.name}</h4>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
