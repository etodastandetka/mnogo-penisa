const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'data/mnogo_rolly.db');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath);

console.log('🌱 Скрипт добавления товаров запущен');
console.log('📁 База данных:', dbPath);

// Функция для добавления товара
function addProduct(name, description, price, imageUrl, category, isPopular = 0, isAvailable = 1) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT OR IGNORE INTO products (name, description, price, image_url, category, is_popular, is_available, created_at)
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
    // Роллы
    console.log('\n🍣 Добавляем роллы...');
    
    await addProduct(
      'Темпура с лососем',
      'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, лосось брусок 30 гр',
      450,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      1,
      1
    );
    
    await addProduct(
      'Просто лосось',
      'Рис 90 гр, нори 1 шт, огурец 30 гр, лосось брусок 30 гр',
      380,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      1,
      1
    );
    
    await addProduct(
      'Острый лосось',
      'Рис 140 гр, нори 1 шт, спайс 20 гр, огурец 20 гр, лосось брусок 30 гр',
      420,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      0,
      1
    );
    
    await addProduct(
      'Канада',
      'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, угорь слайс, унаги 10 гр, кунжут 10 гр',
      520,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      1,
      1
    );
    
    await addProduct(
      'Запеченный калифорния',
      'Рис 140 гр, нори 1 шт, крабовый микс, огурец 20 гр, тобико красный, соус для запекания',
      480,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      0,
      1
    );
    
    await addProduct(
      'Снежная калифорния',
      'Рис 140 гр, нори 1 шт, крабовый микс, огурец 20 гр, тобико красный 15 гр',
      460,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      0,
      1
    );
    
    await addProduct(
      'Запеченный с лососем',
      'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, лосось брусок 30 гр, соус для запекания',
      490,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      1,
      1
    );
    
    await addProduct(
      'Чиккен ролл',
      'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, курица 30 гр, соус для запекания',
      420,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      0,
      1
    );
    
    await addProduct(
      'Ролл просто огурец',
      'Рис 90 гр, нори 1 шт, огурец 30 гр, кунжут 10 гр',
      280,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      0,
      1
    );
    
    await addProduct(
      'Хрустящая аригато',
      'Рис 100 гр, нори 1 шт, катаифи 30 гр, креветки 20 гр, огурец 20 гр, соус аригато 20 гр, унаги 10 гр',
      540,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      0,
      1
    );
    
    await addProduct(
      'Креветки с тамаго',
      'Рис 110 гр, сыр 20 гр, нори 1 шт, тобико 10 гр, омлет 20 гр, огурец 20 гр, креветки 40 гр, соус спайс 20 гр',
      580,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      0,
      1
    );
    
    await addProduct(
      'Опаленный с лососем',
      'Рис 120 гр, сыр 30 гр, нори 1 шт, огурец 20 гр, лосось 50 гр, унаги 15 гр, кунжут 5 гр',
      520,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      0,
      1
    );
    
    await addProduct(
      'Киото',
      'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, креветки 20 гр, кунжут 20 гр, соус для запекания 50 гр',
      560,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      0,
      1
    );
    
    await addProduct(
      'Филадельфия с угрём',
      'Рис 100 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, угорь 50 гр, унаги 5 гр, кунжут 5 гр',
      550,
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
      'rolls',
      1,
      1
    );
    
    // Сеты
    console.log('\n🍱 Добавляем сеты...');
    
    await addProduct(
      'Мини сет',
      'Набор из 4 роллов на выбор',
      1200,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sets',
      1,
      1
    );
    
    await addProduct(
      'Сет "Семейный"',
      'Набор из 8 роллов для всей семьи',
      2200,
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'sets',
      1,
      1
    );
    
    // Снэки
    console.log('\n🍟 Добавляем снэки...');
    
    await addProduct(
      'Наггетсы куриные с картофелем фри',
      'Картофель фри 200 гр, наггетсы 6 шт',
      350,
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'snacks',
      1,
      1
    );
    
    // Напитки
    console.log('\n🥤 Добавляем напитки...');
    
    await addProduct(
      'Фанта 0.5л',
      'Освежающий апельсиновый напиток',
      120,
      'https://images.unsplash.com/photo-1505253716333-d283d2b74e50?w=400&h=300&fit=crop',
      'drinks',
      1,
      1
    );
    
    await addProduct(
      'Фанта 1л',
      'Освежающий апельсиновый напиток',
      180,
      'https://images.unsplash.com/photo-1505253716333-d283d2b74e50?w=400&h=300&fit=crop',
      'drinks',
      0,
      1
    );
    
    await addProduct(
      'Кола 0.5л',
      'Классический газированный напиток',
      120,
      'https://images.unsplash.com/photo-1505253716333-d283d2b74e50?w=400&h=300&fit=crop',
      'drinks',
      1,
      1
    );
    
    await addProduct(
      'Кола 1л',
      'Классический газированный напиток',
      180,
      'https://images.unsplash.com/photo-1505253716333-d283d2b74e50?w=400&h=300&fit=crop',
      'drinks',
      0,
      1
    );
    
    await addProduct(
      'Fuse Tea Ромашка',
      'Успокаивающий чай с ромашкой',
      100,
      'https://images.unsplash.com/photo-1505253716333-d283d2b74e50?w=400&h=300&fit=crop',
      'drinks',
      0,
      1
    );
    
    await addProduct(
      'Fuse Tea Персик',
      'Освежающий чай с персиком',
      100,
      'https://images.unsplash.com/photo-1505253716333-d283d2b74e50?w=400&h=300&fit=crop',
      'drinks',
      0,
      1
    );
    
    // Соусы
    console.log('\n🥢 Добавляем соусы...');
    
    await addProduct(
      'Соевый соус',
      'Классический соевый соус',
      50,
      'https://images.unsplash.com/photo-1505253716333-d283d2b74e50?w=400&h=300&fit=crop',
      'sauces',
      0,
      1
    );
    
    await addProduct(
      'Васаби',
      'Острый японский хрен',
      30,
      'https://images.unsplash.com/photo-1505253716333-d283d2b74e50?w=400&h=300&fit=crop',
      'sauces',
      0,
      1
    );
    
    await addProduct(
      'Имбирь',
      'Маринованный имбирь',
      40,
      'https://images.unsplash.com/photo-1505253716333-d283d2b74e50?w=400&h=300&fit=crop',
      'sauces',
      0,
      1
    );
    
    // Пицца (базовые варианты, можно дополнить)
    console.log('\n🍕 Добавляем пиццу...');
    
    await addProduct(
      'Пицца Маргарита',
      'Томатный соус, моцарелла, базилик',
      450,
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      'pizza',
      1,
      1
    );
    
    await addProduct(
      'Пицца Пепперони',
      'Томатный соус, моцарелла, пепперони',
      520,
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      'pizza',
      1,
      1
    );
    
    await addProduct(
      'Пицца Четыре сыра',
      'Томатный соус, моцарелла, пармезан, горгонзола, рикотта',
      580,
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      'pizza',
      0,
      1
    );
    
    console.log('\n✅ Все товары добавлены успешно!');
    
  } catch (error) {
    console.error('\n❌ Ошибка добавления товаров:', error.message);
    throw error;
  }
}

// Функция для проверки результата
function checkResult() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Проверяем результат...');
    
    // Проверяем количество товаров по категориям
    const categories = ['rolls', 'sets', 'snacks', 'drinks', 'sauces', 'pizza'];
    
    categories.forEach(category => {
      db.get('SELECT COUNT(*) as count FROM products WHERE category = ?', [category], (err, result) => {
        if (err) {
          console.error(`❌ Ошибка проверки категории ${category}:`, err.message);
        } else {
          console.log(`📊 ${category}: ${result.count} товаров`);
        }
      });
    });
    
    // Проверяем общее количество
    db.get('SELECT COUNT(*) as total FROM products', (err, result) => {
      if (err) {
        console.error('❌ Ошибка проверки общего количества:', err.message);
        reject(err);
      } else {
        console.log(`📊 Всего товаров: ${result.total}`);
        resolve();
      }
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
