const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'data/mnogo_rolly.db');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath);

console.log('💰 Скрипт обновления цен запущен');
console.log('📁 База данных:', dbPath);

// Функция для обновления цены товара
function updatePrice(name, newPrice, newDescription = null) {
  return new Promise((resolve, reject) => {
    let sql, params;
    
    if (newDescription) {
      sql = `UPDATE products SET price = ?, description = ? WHERE name = ?`;
      params = [newPrice, newDescription, name];
    } else {
      sql = `UPDATE products SET price = ? WHERE name = ?`;
      params = [newPrice, name];
    }
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error(`❌ Ошибка обновления товара "${name}":`, err.message);
        reject(err);
      } else {
        if (this.changes > 0) {
          console.log(`✅ Обновлен товар: ${name} → ${newPrice} сом${newDescription ? ' (+ описание)' : ''}`);
        } else {
          console.log(`⚠️ Товар "${name}" не найден`);
        }
        resolve(this.changes);
      }
    });
  });
}

// Функция для добавления нового товара
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
        if (this.changes > 0) {
          console.log(`✅ Добавлен товар: ${name} (ID: ${this.lastID})`);
        } else {
          console.log(`⚠️ Товар "${name}" уже существует`);
        }
        resolve(this.lastID);
      }
    });
  });
}

// Функция для удаления изображений товаров (оставляем только category-specific placeholders)
function removeProductImages() {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE products SET image_url = NULL`;
    
    db.run(sql, [], function(err) {
      if (err) {
        console.error(`❌ Ошибка удаления изображений:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Удалены изображения у ${this.changes} товаров`);
        resolve(this.changes);
      }
    });
  });
}

// Главная функция обновления
async function updatePrices() {
  console.log('\n🔄 Начинаем обновление цен...');
  
  try {
    console.log('\n🖼️ Удаляем изображения товаров...');
    await removeProductImages();
    
    console.log('\n🍣 Обновляем цены роллов...');
    
    // Роллы - обновляем цены согласно прайс-листу
    await updatePrice('Киото', 490);
    await updatePrice('Запеченный калифорния', 410, 'Запеченная калифорния с крабовым миксом, огурцом и тобико. 10 штук.'); 
    await updatePrice('Канада', 450);
    await updatePrice('Ролл просто огурец', 270, 'Огурец'); // Поменял название на короткое
    await updatePrice('Снежная калифорния', 430, 'Снежная калифорния');
    await updatePrice('Опаленный с лососем', 480);
    await updatePrice('Хрустящая аригато', 490, 'Рис 100 гр, нори 1 шт, катаифи 30 гр, креветки 20 гр, огурец 20 гр, соус аригато 20 гр, унаги 10 гр');
    await updatePrice('Запеченный с лососем', 480);
    await updatePrice('Темпура с лососем', 420);
    await updatePrice('Острый лосось', 430);
    await updatePrice('Филадельфия с угрём', 500, 'Рис 100 гр, нори 1 шт, сыр 30 гр, огурец 20 гр, угорь 50 гр, унаги 5 гр, кунжут 5 гр');
    await updatePrice('Просто лосось', 320);
    await updatePrice('Креветки с тамаго', 520, 'Рис 110 гр, сыр 20 гр, нори 1 шт, тобико 10 гр, омлет 20 гр, огурец 20 гр, креветки 40 гр, соус спайс 20 гр');
    await updatePrice('Чиккен ролл', 420);
    
    console.log('\n🍟 Обновляем цены снэков...');
    
    // Снэки
    await updatePrice('Наггетсы куриные с картофелем фри', 150, 'Картофель фри 200 гр');
    
    // Добавляем отдельно картошку
    await addProduct(
      'Картошка фри',
      'Картофель фри 200 гр',
      180,
      null, // убираем изображение
      'snacks',
      0,
      1
    );
    
    console.log('\n🍗 Обновляем цены крыльев...');
    
    // Крылья - полностью переделываем
    await updatePrice('Крылья куриные 12 шт', 590);
    await updatePrice('Крылья куриные 18 шт', 850, 'Крылья куриные 18 шт + Coca-Cola 0.3л');
    
    // Добавляем новые размеры крыльев
    await addProduct(
      'Крылья куриные 25 шт',
      'Крылья куриные 25 шт для компании',
      1090,
      null,
      'wings',
      0,
      1
    );
    
    await addProduct(
      'Крылья куриные 32 шт',
      'Крылья куриные 32 шт с 3 соусами',
      1590,
      null,
      'wings',
      0,
      1
    );
    
    console.log('\n🥫 Обновляем цены соусов...');
    
    // Соусы
    await updatePrice('Соевый соус', 70);
    await updatePrice('Васаби', 80);
    await updatePrice('Имбирь', 70);
    
    console.log('\n🍕 Обновляем цены пиццы...');
    
    // Пицца
    await updatePrice('Пицца Четыре сыра', 590, 'Четыре сыра');
    await updatePrice('Пицца Пепперони', 500, 'Пепперони');
    await updatePrice('Пицца Маргарита', 450, 'Маргарита');
    
    // Добавляем новые пиццы
    await addProduct(
      'Пицца с грушей и горгонзолой',
      'С грушей и горгонзолой',
      620,
      null,
      'pizza',
      0,
      1
    );
    
    await addProduct(
      'Пицца с курицей и томатами',
      'Курица и томаты',
      520,
      null,
      'pizza',
      0,
      1
    );
    
    console.log('\n✅ Все цены обновлены успешно!');
    
  } catch (error) {
    console.error('\n❌ Ошибка обновления цен:', error.message);
    throw error;
  }
}

// Функция для проверки результата
function checkResult() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Проверяем результат...');
    
    // Показываем товары с обновленными ценами
    db.all('SELECT name, price, category FROM products ORDER BY category, name', (err, rows) => {
      if (err) {
        console.error('❌ Ошибка проверки:', err.message);
        reject(err);
      } else {
        console.log('\n📊 Актуальные цены:');
        
        const categories = {
          'rolls': '🍣 Роллы',
          'snacks': '🍟 Снэки', 
          'wings': '🍗 Крылья',
          'sauces': '🥫 Соусы',
          'pizza': '🍕 Пицца',
          'drinks': '🥤 Напитки',
          'sets': '🍱 Сеты'
        };
        
        let currentCategory = '';
        rows.forEach(row => {
          if (row.category !== currentCategory) {
            currentCategory = row.category;
            console.log(`\n${categories[currentCategory] || currentCategory}:`);
          }
          console.log(`  ${row.name}: ${row.price} сом`);
        });
        
        resolve();
      }
    });
  });
}

// Главная функция
async function main() {
  try {
    // Обновляем цены
    await updatePrices();
    
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
