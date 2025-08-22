const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Подключаемся к базе данных
const dbPath = './data/mnogo_rolly.db';
const db = new sqlite3.Database(dbPath);

console.log('🔧 Создание таблицы смен...\n');

// Создаем таблицу смен
const createShiftsTable = `
CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shift_number TEXT UNIQUE NOT NULL,
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    opened_by INTEGER NOT NULL,
    closed_by INTEGER,
    total_orders INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    cash_revenue REAL DEFAULT 0,
    card_revenue REAL DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'closed')),
    notes TEXT,
    FOREIGN KEY (opened_by) REFERENCES users(id),
    FOREIGN KEY (closed_by) REFERENCES users(id)
)`;

// Создаем таблицу деталей смены
const createShiftDetailsTable = `
CREATE TABLE IF NOT EXISTS shift_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shift_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    order_number TEXT NOT NULL,
    customer_name TEXT,
    total_amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
)`;

db.serialize(() => {
    // Создаем таблицу смен
    db.run(createShiftsTable, (err) => {
        if (err) {
            console.error('❌ Ошибка создания таблицы shifts:', err);
        } else {
            console.log('✅ Таблица shifts создана успешно');
        }
    });

    // Создаем таблицу деталей смены
    db.run(createShiftDetailsTable, (err) => {
        if (err) {
            console.error('❌ Ошибка создания таблицы shift_details:', err);
        } else {
            console.log('✅ Таблица shift_details создана успешно');
        }
    });

    // Создаем индексы для оптимизации
    db.run('CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status)', (err) => {
        if (err) {
            console.error('❌ Ошибка создания индекса shifts_status:', err);
        } else {
            console.log('✅ Индекс shifts_status создан');
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_shifts_opened_at ON shifts(opened_at)', (err) => {
        if (err) {
            console.error('❌ Ошибка создания индекса shifts_opened_at:', err);
        } else {
            console.log('✅ Индекс shifts_opened_at создан');
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_shift_details_shift_id ON shift_details(shift_id)', (err) => {
        if (err) {
            console.error('❌ Ошибка создания индекса shift_details_shift_id:', err);
        } else {
            console.log('✅ Индекс shift_details_shift_id создан');
        }
    });

    // Проверяем, есть ли открытая смена
    db.get('SELECT * FROM shifts WHERE status = "open" ORDER BY opened_at DESC LIMIT 1', (err, shift) => {
        if (err) {
            console.error('❌ Ошибка проверки открытой смены:', err);
        } else if (!shift) {
            console.log('📝 Открытой смены нет. Создаем первую смену...');
            
            // Создаем первую смену
            const insertShift = `
                INSERT INTO shifts (shift_number, opened_by, status, notes)
                VALUES (?, 1, 'open', 'Первая смена')
            `;
            
            db.run(insertShift, [`SHIFT-${Date.now()}`], function(err) {
                if (err) {
                    console.error('❌ Ошибка создания первой смены:', err);
                } else {
                    console.log('✅ Первая смена создана с ID:', this.lastID);
                }
                
                // Закрываем соединение с базой
                db.close((err) => {
                    if (err) {
                        console.error('❌ Ошибка закрытия базы данных:', err);
                    } else {
                        console.log('✅ База данных закрыта');
                        console.log('\n🎉 Таблицы смен созданы успешно!');
                    }
                });
            });
        } else {
            console.log('✅ Открытая смена найдена:', shift.shift_number);
            
            // Закрываем соединение с базой
            db.close((err) => {
                if (err) {
                    console.error('❌ Ошибка закрытия базы данных:', err);
                } else {
                    console.log('✅ База данных закрыта');
                    console.log('\n🎉 Таблицы смен созданы успешно!');
                }
            });
        }
    });
});
