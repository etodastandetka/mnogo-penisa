import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAdminStore } from '../store/adminStore';
import { User } from '../types';

export const UserManagement: React.FC = () => {
  const { users, loading, error } = useAdminStore();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);



  const handleToggleAdminRights = async (userId: string, currentIsAdmin: boolean) => {
    try {
      setUpdatingUser(userId);
      // TODO: Implement admin rights update
      } catch (err) {
      } finally {
      setUpdatingUser(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Загрузка пользователей...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 text-center mb-4">{error}</div>
          <Button onClick={() => {}} className="w-full">
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          👥 Управление пользователями
          <Badge variant="secondary">{users.length}</Badge>
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-gray-500">📱 {user.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant={user.isAdmin ? "primary" : "secondary"}>
                  {user.isAdmin ? "Админ" : "Пользователь"}
                </Badge>
                
                <Button
                  onClick={() => handleToggleAdminRights(user.id, user.isAdmin || false)}
                  disabled={updatingUser === user.id}
                  variant={user.isAdmin ? "outline" : "primary"}
                  className={user.isAdmin ? "border-red-500 text-red-600 hover:bg-red-50" : ""}
                >
                  {updatingUser === user.id ? (
                    "Обновление..."
                  ) : user.isAdmin ? (
                    "Отозвать права"
                  ) : (
                    "Сделать админом"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Пользователи не найдены
          </div>
        )}
      </CardContent>
    </Card>
  );
};
