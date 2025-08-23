import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../api/products';
import { Product } from '../types';

export const ImageDebugger: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('❌ Ошибка загрузки товаров:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Отладчик изображений</h2>
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="font-bold">{product.name}</h3>
            <p>ID: {product.id}</p>
            <p>Изображение: {product.image_url || 'Нет'}</p>
            <p>Мобильное изображение: {product.mobile_image_url || 'Нет'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
