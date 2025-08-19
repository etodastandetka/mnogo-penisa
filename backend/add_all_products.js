const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'data/mnogo_rolly.db');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath);

console.log('🛒 Скрипт добавления всех товаров запущен');
console.log('📁 База данных:', dbPath);

// Функция для добавления товара
function addProduct(name, description, price, imageUrl, category, isPopular = 0, isAvailable = 1) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT OR REPLACE INTO products (name, description, price, image_url, category, is_popular, is_available, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [name, description, price, imageUrl, category, isPopular, isAvailable], function(err) {
      if (err) {
        console.error(`❌ Ошибка добавления товара "${name}":`, err.message);
        reject(err);
      } else {
        console.log(`✅ Добавлен товар: ${name} - ${price} сом`);
        resolve(this.lastID);
      }
    });
  });
}

// Функция для добавления всех товаров с актуальными ценами
async function addAllProducts() {
  console.log('\n🔄 Начинаем добавление всех товаров с актуальными ценами...');
  
  try {
    // 🍣 РОЛЛЫ
    console.log('\n🍣 Добавляем роллы...');
    
    await addProduct('Киото', 'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, креветки 20 гр, кунжут 20 гр, соус для запекания 50 гр', 490, null, 'rolls', 1, 1);
    await addProduct('Запеченная калифорния', 'Запеченная калифорния с крабовым миксом, огурцом и тобико. 10 штук.', 410, null, 'rolls', 1, 1);
    await addProduct('Канада', 'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, угорь слайс, унаги 10 гр, кунжут 10 гр', 450, null, 'rolls', 1, 1);
    await addProduct('Огурец', 'Рис 90 гр, нори 1 шт, огурец 30 гр, кунжут 10 гр', 270, null, 'rolls', 0, 1);
    await addProduct('Снежная калифорния', 'Рис 140 гр, нори 1 шт, крабовый микс, огурец 20 гр, тобико красный 15 гр', 430, null, 'rolls', 0, 1);
    await addProduct('Опаленный с лососем', 'Рис 120 гр, сыр 30 гр, нори 1 шт, огурец 20 гр, лосось 50 гр, унаги 15 гр, кунжут 5 гр', 480, null, 'rolls', 1, 1);
    await addProduct('Хрустящая аригато', 'Рис 100 гр, нори 1 шт, катаифи 30 гр, креветки 20 гр, огурец 20 гр, соус аригато 20 гр, унаги 10 гр', 490, null, 'rolls', 1, 1);
    await addProduct('Запеченный с лососем', 'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, лосось брусок 30 гр, соус для запекания', 480, null, 'rolls', 1, 1);
    await addProduct('Темпура с лососем', 'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, лосось брусок 30 гр', 420, null, 'rolls', 0, 1);
    await addProduct('Острый лосось', 'Рис 140 гр, нори 1 шт, спайс 20 гр, огурец 20 гр, лосось брусок 30 гр', 430, null, 'rolls', 0, 1);
    await addProduct('Филадельфия с угрём', 'Рис 100 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, угорь 50 гр, унаги 5 гр, кунжут 5 гр', 500, null, 'rolls', 1, 1);
    await addProduct('Просто лосось', 'Рис 90 гр, нори 1 шт, огурец 30 гр, лосось брусок 30 гр', 320, null, 'rolls', 0, 1);
    await addProduct('Креветки с тамаго', 'Рис 110 гр, сыр 20 гр, нори 1 шт, тобико 10 гр, омлет 20 гр, огурец 20 гр, креветки 40 гр, соус спайс 20 гр', 520, null, 'rolls', 1, 1);
    await addProduct('Чиккен ролл', 'Рис 140 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, курица 30 гр, соус для запекания', 420, null, 'rolls', 0, 1);

    // 🍟 СНЭКИ
    console.log('\n🍟 Добавляем снэки...');
    
    await addProduct('Картошка фри', 'Картофель фри 200 гр', 180, null, 'snacks', 0, 1);
    await addProduct('Наггетсы', 'Картофель фри 200 гр + наггетсы 6 шт', 150, null, 'snacks', 1, 1);

    // 🍗 КРЫЛЬЯ
    console.log('\n🍗 Добавляем крылья...');
    
    await addProduct('Крылья куриные 12 шт', 'Крылья куриные 12 шт', 590, null, 'wings', 1, 1);
    await addProduct('Крылья куриные 18 шт', 'Крылья куриные 18 шт + Coca-Cola 0.3л', 850, null, 'wings', 0, 1);
    await addProduct('Крылья куриные 25 шт', 'Крылья куриные 25 шт для компании', 1090, null, 'wings', 0, 1);
    await addProduct('Крылья куриные 32 шт', 'Крылья куриные 32 шт с 3 соусами', 1590, null, 'wings', 0, 1);

    // 🥫 СОУСЫ
    console.log('\n🥫 Добавляем соусы...');
    
    await addProduct('Соевый соус', 'Классический соевый соус', 70, null, 'sauces', 0, 1);
    await addProduct('Васаби', 'Острый японский хрен', 80, null, 'sauces', 0, 1);
    await addProduct('Имбирь', 'Маринованный имбирь', 70, null, 'sauces', 0, 1);

    // 🍕 ПИЦЦА
    console.log('\n🍕 Добавляем пиццу...');
    
    await addProduct('Четыре сыра', 'Томатный соус, моцарелла, пармезан, горгонзола, рикотта', 590, null, 'pizza', 1, 1);
    await addProduct('Пепперони', 'Томатный соус, моцарелла, пепперони', 500, null, 'pizza', 1, 1);
    await addProduct('Маргарита', 'Томатный соус, моцарелла, базилик', 450, null, 'pizza', 0, 1);
    await addProduct('Пицца с грушей и горгонзолой', 'С грушей и горгонзолой', 620, null, 'pizza', 0, 1);
    await addProduct('Пицца с курицей и томатами', 'Курица и томаты', 520, null, 'pizza', 0, 1);

    // 🥤 НАПИТКИ
    console.log('\n🥤 Добавляем напитки...');
    
    await addProduct('Кола 0.5л', 'Классический газированный напиток', 120, null, 'drinks', 1, 1);
    await addProduct('Кола 1л', 'Классический газированный напиток', 180, null, 'drinks', 0, 1);
    await addProduct('Фанта 0.5л', 'Освежающий апельсиновый напиток', 120, null, 'drinks', 1, 1);
    await addProduct('Фанта 1л', 'Освежающий апельсиновый напиток', 180, null, 'drinks', 0, 1);
    await addProduct('Fuse Tea Персик', 'Освежающий чай с персиком', 100, null, 'drinks', 0, 1);
    await addProduct('Fuse Tea Ромашка', 'Успокаивающий чай с ромашкой', 100, null, 'drinks', 0, 1);

    // 🍱 СЕТЫ
    console.log('\n🍱 Добавляем сеты...');
    
    await addProduct('Мини сет', 'Набор из 4 роллов на выбор', 1200, null, 'sets', 1, 1);
    await addProduct('Сет "Семейный"', 'Набор из 8 роллов для всей семьи', 2200, null, 'sets', 1, 1);

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
    
    // Подсчитываем товары по категориям
    const categories = {
      'rolls': '🍣 Роллы',
      'snacks': '🍟 Снэки', 
      'wings': '🍗 Крылья',
      'sauces': '🥫 Соусы',
      'pizza': '🍕 Пицца',
      'drinks': '🥤 Напитки',
      'sets': '🍱 Сеты'
    };
    
    db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category', (err, categories_result) => {
      if (err) {
        console.error('❌ Ошибка подсчета категорий:', err.message);
      } else {
        console.log('\n📊 Товары по категориям:');
        categories_result.forEach(row => {
          const emoji = categories[row.category] || row.category;
          console.log(`  ${emoji}: ${row.count} товаров`);
        });
      }
      
      // Проверяем общее количество
      db.get('SELECT COUNT(*) as total FROM products', (err, result) => {
        if (err) {
          console.error('❌ Ошибка проверки общего количества:', err.message);
          reject(err);
        } else {
          console.log(`\n📊 Всего товаров: ${result.total}`);
          resolve();
        }
      });
    });
  });
}

// Главная функция
async function main() {
  try {
    // Добавляем товары
    await addAllProducts();
    
    // Проверяем результат
    await checkResult();
    
    console.log('\n✅ Скрипт завершен успешно!');
    console.log('🎯 Теперь можно запускать фронтенд - все товары добавлены с актуальными ценами!');
    
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
