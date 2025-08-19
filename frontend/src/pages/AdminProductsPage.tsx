import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { client } from '../api/client';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/admin';
import { ProductImageUpload } from '../components/ProductImageUpload';

import { 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Upload
} from 'lucide-react';

// Функция для отображения названий категорий
const getCategoryDisplayName = (category: string): string => {
  const categoryNames: { [key: string]: string } = {
    'rolls': 'Роллы',
    'sets': 'Сеты',
    'drinks': 'Напитки',
    'sauces': 'Соусы',
    'snacks': 'Снэки',
    'wings': 'Крылья',
    'pizza': 'Пицца'
  };
  return categoryNames[category] || category;
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    is_available: true
  });
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    is_available: true
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [currentProductForImage, setCurrentProductForImage] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getProducts();
        setProducts(productsData);
        setError(null);
      } catch (err) {
        setError('Ошибка загрузки товаров');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setShowAddModal(true);
    setAddForm({
      name: '',
      description: '',
      price: 0,
      category: '',
      image_url: '',
      is_available: true
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-red-400', 'bg-red-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-red-400', 'bg-red-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-red-400', 'bg-red-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Функция для сжатия изображения
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Устанавливаем максимальные размеры
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Изменяем размеры, сохраняя пропорции
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Сжимаем с качеством 0.8
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSaveAdd = async () => {
    if (!addForm.name || !addForm.description || !addForm.price || !addForm.category) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      console.log('🆕 Создаем новый товар...');

      // Сначала создаем товар БЕЗ изображения
      const productData = {
        name: addForm.name,
        description: addForm.description,
        price: addForm.price,
        category: addForm.category,
        image_url: '', // Пустая строка изначально
        is_available: addForm.is_available
      };

      console.log('Создаем товар с данными:', productData);
      const result = await createProduct(productData);
      console.log('✅ Товар создан с ID:', result.productId);

      // Если выбрано изображение, загружаем его отдельно
      let finalImageUrl = '';
      if (selectedImage) {
        try {
          console.log('📸 Загружаем изображение для нового товара...');
          
          // Создаем FormData для загрузки изображения
          const formData = new FormData();
          formData.append('image', selectedImage);
          
          const uploadResponse = await fetch('/api/admin/upload-image', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Ошибка загрузки изображения: ${uploadResponse.status}`);
          }
          
          const uploadResult = await uploadResponse.json();
          finalImageUrl = uploadResult.imageUrl || uploadResult.url || uploadResult.path;
          console.log('✅ Изображение загружено:', finalImageUrl);
          
          // Обновляем товар с новым изображением
          console.log('🔄 Обновляем товар с изображением...');
          await updateProduct(String(result.productId), {
            ...productData,
            image_url: finalImageUrl
          });
          console.log('✅ Товар обновлен с изображением');
          
        } catch (err) {
          console.error('❌ Ошибка загрузки изображения:', err);
          alert('Товар создан, но не удалось загрузить изображение. Вы можете добавить его позже.');
        }
      }

      // Обновляем список товаров
      const newProduct = {
        id: result.productId,
        ...productData,
        image_url: finalImageUrl,
        created_at: new Date().toISOString()
      };
      setProducts([newProduct, ...products]);
      
      setShowAddModal(false);
      setAddForm({
        name: '',
        description: '',
        price: 0,
        category: '',
        image_url: '',
        is_available: true
      });
      setSelectedImage(null);
      setImagePreview('');
      alert('Товар успешно добавлен!');
    } catch (err) {
      console.error('❌ Ошибка создания товара:', err);
      alert('Ошибка при добавлении товара');
    }
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setAddForm({
      name: '',
      description: '',
      price: 0,
      category: '',
      image_url: '',
      is_available: true
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image_url: product.image_url || '',
      is_available: product.is_available
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      console.log('Отправляем данные для обновления:', editForm);
      
      // Если выбрано новое изображение, конвертируем в base64
      let imageUrl = editingProduct.image_url; // Сохраняем текущее изображение по умолчанию
      if (selectedImage) {
        try {
          // Конвертируем изображение в base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          
          reader.readAsDataURL(selectedImage);
          imageUrl = await base64Promise;
          
          console.log('Новое фото конвертировано в base64, размер:', imageUrl.length);
        } catch (err) {
          console.error('Ошибка конвертации фото:', err);
          alert('Ошибка при обработке фото. Попробуйте еще раз.');
          return;
        }
      }
      
      // Создаем объект с данными для обновления
      const updateData = {
        ...editForm,
        image_url: imageUrl
      };
      
      console.log('Отправляем данные для обновления:', updateData);
      
      await updateProduct(String(editingProduct.id), updateData);
      
      // Обновляем список товаров
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...editForm, image_url: imageUrl }
          : p
      );
      setProducts(updatedProducts);
      
      setShowEditModal(false);
      setEditingProduct(null);
      setSelectedImage(null);
      setImagePreview('');
      alert('Товар успешно обновлен!');
    } catch (err) {
      console.error('Ошибка обновления товара:', err);
      alert('Ошибка при обновлении товара');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setEditForm({
      name: '',
      description: '',
      price: 0,
      category: '',
      image_url: '',
      is_available: true
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleImageUpload = (product: Product) => {
    setCurrentProductForImage(product);
    setShowImageUploadModal(true);
  };

  const handleImageUploadComplete = async (imageUrl: string) => {
    if (currentProductForImage) {
      try {
        console.log('Обновляем товар с новым фото:', { 
          productId: currentProductForImage.id, 
          imageUrl 
        });
        
        // Создаем объект с обновленными данными
        const updatedProductData = {
          name: currentProductForImage.name,
          description: currentProductForImage.description,
          price: currentProductForImage.price,
          category: currentProductForImage.category,
          image_url: imageUrl,
          is_available: currentProductForImage.is_available
        };
        
        console.log('Отправляем данные для обновления:', updatedProductData);
        
        // Обновляем в базе данных
        await updateProduct(String(currentProductForImage.id), updatedProductData);
        
        // Обновляем товар в списке
        const updatedProducts = products.map(p => 
          p.id === currentProductForImage.id 
            ? { ...p, image_url: imageUrl }
            : p
        );
        setProducts(updatedProducts);
        
        console.log('Товар успешно обновлен с новым фото');
        
        // Принудительно обновляем список товаров с сервера
        console.log('🔄 Обновляем список товаров с сервера...');
        try {
          const updatedProductsFromServer = await getProducts();
          setProducts(updatedProductsFromServer);
          console.log('✅ Список товаров обновлен с сервера');
        } catch (err) {
          console.error('❌ Ошибка обновления списка товаров:', err);
        }
      } catch (error) {
        console.error('Ошибка обновления товара:', error);
        alert('Ошибка обновления товара. Попробуйте еще раз.');
      }
    }
    setShowImageUploadModal(false);
    setCurrentProductForImage(null);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await deleteProduct(String(productId));
        // Обновляем список товаров
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);
        alert('Товар успешно удален!');
      } catch (err) {
        alert('Ошибка при удалении товара');
      }
    }
  };

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesStatus = !selectedStatus || 
      (selectedStatus === 'active' && product.is_available) ||
      (selectedStatus === 'inactive' && !product.is_available);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Заголовок и кнопки */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Товары</h2>
            <p className="text-gray-600 mt-1">Управление каталогом товаров</p>
          </div>
          
          <button 
            onClick={handleAddProduct}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить товар</span>
          </button>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Фильтры */}
        <Card className="border-0 shadow-soft mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Название товара..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Все категории</option>
                  <option value="rolls">Роллы</option>
                  <option value="sets">Сеты</option>
                  <option value="drinks">Напитки</option>
                  <option value="sauces">Соусы</option>
                  <option value="snacks">Снэки</option>
                  <option value="wings">Крылья</option>
                  <option value="pizza">Пицца</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Все статусы</option>
                  <option value="active">Активные</option>
                  <option value="inactive">Неактивные</option>
                  <option value="out_of_stock">Нет в наличии</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Список товаров */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Список товаров ({filteredProducts.length})
            </h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge className="bg-blue-100 text-blue-800">
                            {getCategoryDisplayName(product.category)}
                          </Badge>
                          <Badge className={product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {product.is_available ? 'В наличии' : 'Нет в наличии'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{product.price.toLocaleString()} сом</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button 
                          onClick={() => handleImageUpload(product)}
                          className="p-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Загрузить фото"
                        >
                          <Upload className="w-4 h-4 text-blue-600" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Товары не найдены</p>
                <button 
                  onClick={handleAddProduct}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Добавить первый товар
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно редактирования товара */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Редактировать товар
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Название */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название товара *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Введите название товара"
                  />
                </div>

                {/* Описание */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание *
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Введите описание товара"
                  />
                </div>

                {/* Цена */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (сом) *
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* Категория */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Выберите категорию</option>
                    <option value="rolls">Роллы</option>
                    <option value="sets">Сеты</option>
                    <option value="drinks">Напитки</option>
                    <option value="sauces">Соусы</option>
                    <option value="snacks">Снэки</option>
                    <option value="wings">Крылья</option>
                    <option value="pizza">Пицца</option>
                  </select>
                </div>

                {/* Загрузка изображения */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Изображение товара
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Максимальный размер файла: 5MB. Поддерживаемые форматы: JPG, PNG, GIF
                  </p>
                  
                  {/* Текущее изображение */}
                  {editingProduct?.image_url && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Текущее изображение:</p>
                      <img
                        src={editingProduct.image_url}
                        alt="Текущее изображение"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {/* Drag & Drop зона */}
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                  <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="edit-image-upload"
                      />
                      <label
                        htmlFor="edit-image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {selectedImage ? 'Файл выбран' : 'Нажмите для выбора файла'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          или перетащите файл сюда
                        </span>
                      </label>
                    </div>

                    {/* Предварительный просмотр */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Предварительный просмотр"
                          className="w-full max-w-md h-auto rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview('');
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Статус */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.is_available}
                      onChange={(e) => setEditForm({...editForm, is_available: e.target.checked})}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Товар в наличии
                    </span>
                  </label>
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления товара */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Добавить новый товар
                </h3>
                <button
                  onClick={handleCancelAdd}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Название */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название товара *
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Введите название товара"
                  />
                </div>

                {/* Описание */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание *
                  </label>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Введите описание товара"
                  />
                </div>

                {/* Цена */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (сом) *
                  </label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={(e) => setAddForm({...addForm, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* Категория */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Выберите категорию</option>
                    <option value="rolls">Роллы</option>
                    <option value="sets">Сеты</option>
                    <option value="drinks">Напитки</option>
                    <option value="sauces">Соусы</option>
                    <option value="snacks">Снэки</option>
                    <option value="wings">Крылья</option>
                    <option value="pizza">Пицца</option>
                  </select>
                </div>

                {/* Загрузка изображения */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Изображение товара
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Максимальный размер файла: 5MB. Поддерживаемые форматы: JPG, PNG, GIF
                  </p>
                  <div className="space-y-3">
                    {/* Drag & Drop зона */}
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {selectedImage ? 'Файл выбран' : 'Нажмите для выбора файла'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          или перетащите файл сюда
                        </span>
                      </label>
                    </div>

                    {/* Предварительный просмотр */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Предварительный просмотр"
                          className="w-full max-w-md h-auto rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview('');
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}


                  </div>
                </div>

                {/* Статус */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={addForm.is_available}
                      onChange={(e) => setAddForm({...addForm, is_available: e.target.checked})}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Товар в наличии
                    </span>
                  </label>
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveAdd}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Добавить товар
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно загрузки фото товара */}
      {showImageUploadModal && currentProductForImage && (
        <ProductImageUpload
          onImageUpload={handleImageUploadComplete}
          onClose={() => {
            setShowImageUploadModal(false);
            setCurrentProductForImage(null);
          }}
          currentImageUrl={currentProductForImage.image_url}
        />
      )}
    </AdminLayout>
  );
};
