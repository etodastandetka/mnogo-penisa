const fs = require('fs');
const path = require('path');

// Читаем файл chai.png и конвертируем в base64
const imagePath = path.join(__dirname, 'public', 'images', 'chai.png');

try {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  console.log('Base64 изображения chai.png:');
  console.log('data:image/png;base64,' + base64Image);
  
  // Сохраняем в файл для удобства
  fs.writeFileSync('chai_base64.txt', 'data:image/png;base64,' + base64Image);
  console.log('\nBase64 также сохранен в файл chai_base64.txt');
  
} catch (error) {
  console.error('Ошибка чтения файла:', error.message);
}
