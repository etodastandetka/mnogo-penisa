import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Eye, CheckCircle, XCircle, Download } from 'lucide-react';

interface Receipt {
  id: number;
  order_id: number;
  payment_method: string;
  amount: number;
  receipt_file: string | null;
  note: string;
  status: 'pending' | 'confirmed' | 'rejected';
  timestamp: string;
  customer_name: string;
  phone: string;
  address: string;
  total_amount: number;
}

export const AdminReceipts: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/receipts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки чеков');
      }

      const data = await response.json();
      setReceipts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const updateReceiptStatus = async (receiptId: number, status: 'confirmed' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/receipts/${receiptId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления статуса');
      }

      // Обновляем локальное состояние
      setReceipts(prev => prev.map(receipt => 
        receipt.id === receiptId ? { ...receipt, status } : receipt
      ));
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      alert('Ошибка обновления статуса');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Ожидает</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-green-500">Подтвержден</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Отклонен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'Bank':
        return 'Банковская карта';
      case 'QR':
        return 'QR-код';
      case 'Cash':
        return 'Наличные';
      default:
        return method;
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка чеков...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Чеки оплаты</h2>
        <Button onClick={fetchReceipts} variant="outline">
          Обновить
        </Button>
      </div>

      {receipts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Чеки не найдены</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {receipts.map((receipt) => (
            <Card key={receipt.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Чек #{receipt.id} - Заказ #{receipt.order_id}
                  </CardTitle>
                  {getStatusBadge(receipt.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Клиент:</span> {receipt.customer_name}
                    </div>
                    <div>
                      <span className="font-semibold">Телефон:</span> {receipt.phone}
                    </div>
                    <div>
                      <span className="font-semibold">Адрес:</span> {receipt.address}
                    </div>
                    <div>
                      <span className="font-semibold">Способ оплаты:</span> {getPaymentMethodLabel(receipt.payment_method)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Сумма заказа:</span> {receipt.total_amount} сом
                    </div>
                    <div>
                      <span className="font-semibold">Сумма оплаты:</span> {receipt.amount} сом
                    </div>
                    <div>
                      <span className="font-semibold">Дата:</span> {new Date(receipt.timestamp).toLocaleString('ru-RU')}
                    </div>
                    {receipt.note && (
                      <div>
                        <span className="font-semibold">Примечание:</span> {receipt.note}
                      </div>
                    )}
                  </div>
                </div>

                {receipt.receipt_file && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Чек:</span>
                      <div className="flex gap-2">
                                                 <Button
                           variant="outline"
                           size="sm"
                           onClick={() => window.open(`${receipt.receipt_file}`, '_blank')}
                         >
                           <Eye className="w-4 h-4 mr-1" />
                           Просмотр
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             const link = document.createElement('a');
                             link.href = `${receipt.receipt_file}`;
                             link.download = `receipt-${receipt.id}.jpg`;
                             link.click();
                           }}
                         >
                           <Download className="w-4 h-4 mr-1" />
                           Скачать
                         </Button>
                      </div>
                    </div>
                  </div>
                )}

                {receipt.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => updateReceiptStatus(receipt.id, 'confirmed')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Подтвердить
                    </Button>
                    <Button
                      onClick={() => updateReceiptStatus(receipt.id, 'rejected')}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Отклонить
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
