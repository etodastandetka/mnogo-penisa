import React, { useState, useEffect } from 'react';
import { productsApi } from '../api/products';
import { Product } from '../types';

export const ImageDebugger: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-4">Загрузка товаров для отладки...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Ошибка: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Отладка изображений товаров</h1>
      
      <div className="mb-4 p-4 bg-white rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Статистика:</h2>
        <p>Всего товаров: {products.length}</p>
        <p>Товаров с изображениями: {products.filter(p => p.image_url && p.image_url !== '').length}</p>
        <p>Товаров без изображений: {products.filter(p => !p.image_url || p.image_url === '').length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            
            <div className="mb-2">
              <p className="text-sm text-gray-600">ID: {product.id}</p>
              <p className="text-sm text-gray-600">Цена: {product.price}</p>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500">Оригинальный image_url:</p>
              <p className="text-xs bg-gray-100 p-1 rounded break-all">
                {product.original_image_url || 'null'}
              </p>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500">Обработанный image_url:</p>
              <p className="text-xs bg-gray-100 p-1 rounded break-all">
                {product.image_url || 'null'}
              </p>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500">Поле image:</p>
              <p className="text-xs bg-gray-100 p-1 rounded break-all">
                {product.image || 'null'}
              </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <img
                src={product.image_url || product.image}
                alt={product.name}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  console.error('❌ Ошибка изображения:', product.name, e.currentTarget.src);
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
              <div 
                className="w-full h-32 bg-red-100 flex items-center justify-center text-red-600 text-sm"
                style={{ display: 'none' }}
              >
                Ошибка загрузки
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              <p>is_available: {product.is_available ? 'true' : 'false'}</p>
              <p>isPopular: {product.isPopular ? 'true' : 'false'}</p>
              <p>category: {product.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
