import React from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminReceipts } from '../components/AdminReceipts';

const AdminReceiptsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление чеками</h1>
          <p className="text-gray-600 mt-2">
            Просмотр и управление чеками оплаты заказов
          </p>
        </div>
        
        <AdminReceipts />
      </div>
    </AdminLayout>
  );
};

export default AdminReceiptsPage;
