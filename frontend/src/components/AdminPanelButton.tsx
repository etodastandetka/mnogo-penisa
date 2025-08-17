import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useUserStore } from '../store/userStore';

export const AdminPanelButton: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useUserStore();


  if (!isAdmin) {
    return null;
  }

  return (
    <Button
      onClick={() => navigate('/admin')}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
    >
      🛠️ Админ панель
    </Button>
  );
};
