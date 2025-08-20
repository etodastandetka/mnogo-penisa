import React from 'react';
import { Button } from './ui/Button';
import { Printer } from 'lucide-react';

interface PrintReceiptProps {
  order: any;
  onClose: () => void;
}

export const PrintReceipt: React.FC<PrintReceiptProps> = ({ order, onClose }) => {
  const printReceipt = () => {
    try {
      // Создаем Blob с HTML контентом
      const receiptContent = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Чек заказа ${order.orderNumber || order.id || 'N/A'}</title>
        <style>
          body {
            font-family: 'Arial', 'Helvetica', 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 0;
            padding: 10px;
            width: 80mm;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .company-info {
            font-size: 10px;
            margin-bottom: 5px;
          }
          .order-info {
            margin-bottom: 10px;
          }
          .order-number {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .order-date {
            margin-bottom: 5px;
          }
          .customer-info {
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .items-table {
            width: 100%;
            margin-bottom: 10px;
          }
          .items-table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 2px 0;
          }
          .items-table td {
            padding: 2px 0;
            vertical-align: top;
          }
          .item-name {
            width: 60%;
          }
          .item-quantity {
            width: 15%;
            text-align: center;
          }
          .item-price {
            width: 25%;
            text-align: right;
          }
          .total-section {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-bottom: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .total-final {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 15px;
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
          .tax-info {
            margin-bottom: 5px;
          }
          .qr-code {
            text-align: center;
            margin: 10px 0;
          }
          .qr-code div {
            width: 80px;
            height: 80px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
            color: #fff;
            font-size: 40px;
          }
          @media print {
            body {
              width: 80mm;
              margin: 0;
              padding: 5px;
            }
          }
        </style>
      </head>
      <body>
                 <div class="header">
           <div class="company-name">MNOGO ROLLY</div>
           <div class="company-info">Доставка суши и роллов</div>
           <div class="company-info">ИП: Султанкулов А.Б.</div>
           <div class="company-info">ИНН: 20504198701431</div>
           <div class="company-info">Адрес: г. Бишкек, ул. Ахунбаева, 182 Б</div>
           <div class="company-info">Тел: +996 (709) 611-043</div>
           <div class="company-info">Касса: ККТ-001</div>
         </div>

        <div class="order-info">
          <div class="order-number">Заказ №${order.orderNumber || order.id || 'N/A'}</div>
          <div class="order-date">Дата: ${new Date(order.createdAt || new Date()).toLocaleDateString('ru-RU')}</div>
          <div class="order-date">Время: ${new Date(order.createdAt || new Date()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>

        <div class="customer-info">
          <div>Клиент: ${order.customerName || order.customer_name || 'Гость'}</div>
          <div>Телефон: ${order.customerPhone || order.phone || 'Не указан'}</div>
          <div>Адрес: ${order.deliveryAddress || order.delivery_address || 'Не указан'}</div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th class="item-name">Товар</th>
              <th class="item-quantity">Кол-во</th>
              <th class="item-price">Цена</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((item: any) => `
              <tr>
                <td class="item-name">${item.productName || item.name || 'Товар'}</td>
                <td class="item-quantity">${item.quantity || 1}</td>
                <td class="item-price">${item.price || 0} сом</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Подытог:</span>
            <span>${order.totalAmount || 0} сом</span>
          </div>
          <div class="total-row">
            <span>Доставка:</span>
            <span>0 сом</span>
          </div>
          <div class="total-row total-final">
            <span>ИТОГО:</span>
            <span>${order.totalAmount || 0} сом</span>
          </div>
        </div>

                 <div class="footer">
           <div>Спасибо за заказ!</div>
           <div>Приятного аппетита!</div>
           <div class="qr-code">
             <div style="width: 80px; height: 80px; margin: 0 auto; background: #000; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #fff;">💰</div>
             <div style="font-size: 10px; margin-top: 5px;">QR code Для чеков</div>
           </div>
           <div>Чек действителен для предъявления в налоговые органы КР</div>
           <div>Фискальный документ №${order.orderNumber || order.id || 'N/A'}</div>
         </div>
      </body>
      </html>
    `;

      // Создаем Blob и URL с правильной кодировкой
      const utf8BOM = '\uFEFF'; // Byte Order Mark для UTF-8
      const blob = new Blob([utf8BOM + receiptContent], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Открываем окно с правильным URL
      const printWindow = window.open(url, '_blank');
      if (!printWindow) {
        alert('Пожалуйста, разрешите всплывающие окна для печати чека');
        URL.revokeObjectURL(url);
        return;
      }

      // Ждем загрузки контента перед печатью
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          URL.revokeObjectURL(url);
        }, 1000);
      };
      
      // Fallback если onload не сработает
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            URL.revokeObjectURL(url);
          }, 1000);
        } else {
          URL.revokeObjectURL(url);
        }
      }, 1000);
    } catch (error) {
      alert('Ошибка печати чека. Попробуйте еще раз.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={printReceipt}
        size="sm"
        variant="outline"
        className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
      >
        <Printer className="w-4 h-4" />
        Печать чека
      </Button>
    </div>
  );
};

