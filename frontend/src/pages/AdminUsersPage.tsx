import React from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { UserManagement } from '../components/UserManagement';

export const AdminUsersPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Управление пользователями</h2>
          <p className="text-gray-600 mt-1">
            Управление правами доступа и просмотр информации о пользователях
          </p>
        </div>

        {/* Компонент управления пользователями */}
        <UserManagement />
      </div>
    </AdminLayout>
  );
};
