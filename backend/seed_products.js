const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'database.sqlite');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath);

console.log('🌱 Скрипт добавления товаров запущен');
console.log('📁 База данных:', dbPath);

// Функция для добавления товара
function addProduct(name, description, price, imageUrl, category, isPopular = 0, isAvailable = 1) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO products (name, description, price, image_url, category, is_popular, is_available, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [name, description, price, imageUrl, category, isPopular, isAvailable], function(err) {
      if (err) {
        console.error(`❌ Ошибка добавления товара "${name}":`, err.message);
        reject(err);
      } else {
        console.log(`✅ Добавлен товар: ${name} (ID: ${this.lastID})`);
        resolve(this.lastID);
      }
    });
  });
}

// Функция для добавления всех товаров
async function seedProducts() {
  console.log('\n🔄 Начинаем добавление товаров...');
  
  try {
    // Суши и роллы
    console.log('\n🍣 Добавляем суши и роллы...');
    await addProduct(
      'Филадельфия ролл',
      'Классический ролл с лососем и сливочным сыром',
      450,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sushi_rolls',
      1,
      1
    );
    
    await addProduct(
      'Калифорния ролл',
      'Ролл с крабом и авокадо',
      380,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sushi_rolls',
      1,
      1
    );
    
    await addProduct(
      'Унаги ролл',
      'Ролл с угрем и огурцом',
      520,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sushi_rolls',
      0,
      1
    );
    
    await addProduct(
      'Чиккен ролл',
      'Ролл с курицей и овощами',
      320,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sushi_rolls',
      0,
      1
    );
    
    await addProduct(
      'Четыре сыра',
      'Ролл с четырьмя видами сыра',
      280,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sushi_rolls',
      0,
      1
    );
    
    await addProduct(
      'С грушей и горгонзолой',
      'Ролл с грушей и голубым сыром',
      350,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sushi_rolls',
      0,
      1
    );
    
    await addProduct(
      'Пепперони',
      'Ролл с пепперони и сыром',
      290,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sushi_rolls',
      0,
      1
    );
    
    await addProduct(
      'Курица с томатами',
      'Ролл с курицей и томатами',
      310,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sushi_rolls',
      0,
      1
    );
    
    await addProduct(
      'Маргарита',
      'Классическая пицца с томатами и моцареллой',
      420,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'pizza',
      1,
      1
    );
    
    await addProduct(
      'Крылышки 12 шт',
      'Хрустящие куриные крылышки',
      280,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'wings',
      0,
      1
    );
    
    await addProduct(
      'Крылышки 18 шт',
      'Хрустящие куриные крылышки',
      380,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'wings',
      0,
      1
    );
    
    await addProduct(
      'Крылышки 25 шт',
      'Хрустящие куриные крылышки',
      480,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'wings',
      0,
      1
    );
    
    await addProduct(
      'Крылышки 32 шт',
      'Хрустящие куриные крылышки',
      580,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'wings',
      0,
      1
    );
    
    await addProduct(
      'Картошка фри',
      'Хрустящая картошка фри',
      120,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Нагетсы',
      'Куриные нагетсы',
      180,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Запеченная калифорния',
      'Запеченная калифорния с соусом',
      220,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Канада',
      'Запеченная канада',
      190,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Огурец',
      'Свежий огурец',
      80,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Снежная калифорния',
      'Снежная калифорния',
      240,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Опальный с лососем',
      'Опальный ролл с лососем',
      260,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Хрустящая аригато',
      'Хрустящая аригато',
      200,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Запеченный с лососем',
      'Запеченный ролл с лососем',
      280,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Темпура с лососем',
      'Темпура с лососем',
      300,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Острый лосось',
      'Острый лосось',
      320,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Фила с угрем',
      'Фила с угрем',
      340,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Просто лосось',
      'Просто лосось',
      280,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    await addProduct(
      'Креветки с тамаго',
      'Креветки с тамаго',
      260,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'snacks',
      0,
      1
    );
    
    // Соусы
    console.log('\n🥫 Добавляем соусы...');
    await addProduct(
      'Соус',
      'Классический соус',
      50,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sauces',
      0,
      1
    );
    
    await addProduct(
      'Набор из 3 соусов',
      'Набор из 3 разных соусов',
      120,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sauces',
      0,
      1
    );
    
    // Напитки
    console.log('\n🥤 Добавляем напитки...');
    await addProduct(
      'Coca-Cola 0.3л',
      'Coca-Cola 0.3 литра',
      80,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'drinks',
      0,
      1
    );
    
    await addProduct(
      'Coca-Cola 0.5л',
      'Coca-Cola 0.5 литра',
      100,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'drinks',
      0,
      1
    );
    
    await addProduct(
      'Сок апельсиновый',
      'Свежевыжатый апельсиновый сок',
      120,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'drinks',
      0,
      1
    );
    
    console.log('\n🎉 Все товары добавлены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка добавления товаров:', error.message);
    throw error;
  }
}

// Функция для проверки результата
function checkResult() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Проверяем результат...');
    
    db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
      if (err) {
        console.error('❌ Ошибка проверки:', err.message);
        reject(err);
        return;
      }
      
      console.log(`📊 Товаров в базе: ${result.count}`);
      
      // Показываем товары по категориям
      db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category', (err, categories) => {
        if (err) {
          console.error('❌ Ошибка проверки категорий:', err.message);
          reject(err);
          return;
        }
        
        console.log('\n📋 Товары по категориям:');
        categories.forEach(cat => {
          console.log(`  ${cat.category}: ${cat.count} товаров`);
        });
        
        resolve();
      });
    });
  });
}

// Главная функция
async function main() {
  try {
    // Добавляем товары
    await seedProducts();
    
    // Проверяем результат
    await checkResult();
    
    console.log('\n✅ Скрипт завершен успешно!');
    
  } catch (error) {
    console.error('\n❌ Ошибка выполнения скрипта:', error.message);
    process.exit(1);
  } finally {
    // Закрываем соединение с базой данных
    db.close((err) => {
      if (err) {
        console.error('❌ Ошибка закрытия базы данных:', err.message);
      } else {
        console.log('🔒 Соединение с базой данных закрыто');
      }
      process.exit(0);
    });
  }
}

// Запускаем скрипт
main();
