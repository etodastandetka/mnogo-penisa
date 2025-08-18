import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Settings,
  Bot,
  CreditCard,
  RefreshCw,
  Save
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { client } from '../api/client';

export const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useUserStore();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    telegram: {
      botToken: '',
      chatId: '',
      enabled: false
    },
    bank: {
      bankLink: 'https://app.mbank.kg/qr#',
      megaPayLink: 'https://megapay.kg/get#',
      dengiLink: 'https://api.dengi.o.kg/ru/qr#',
      balanceLink: 'https://balance.kg#',
      bakaiLink: 'https://bakai24.app#',
      demirLink: 'https://retail.demirbank.kg#',
      optimaLink: 'https://optimabank.kg/index.php?lang=ru#'
    }
  });

  useEffect(() => {
    // Проверяем, что пользователь админ
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }

    // Загружаем банковские настройки
    loadBankSettings();
  }, [user, isAdmin, navigate]);

  const loadBankSettings = async () => {
    try {
      const response = await client.get('/bank-settings');
      const data = response.data;
      setSettings(prev => ({
        ...prev,
        bank: {
          ...prev.bank,
          bankLink: data.bank_link || 'https://app.mbank.kg/qr#'
        }
      }));
    } catch (error) {
      // Игнорируем ошибку
    }
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Отправляем настройки на сервер
      const response = await client.post('/bank-settings', {
        bank_name: 'MBank',
        bank_link: settings.bank.bankLink
      });

      if (response.status === 200) {
        alert('Настройки успешно сохранены!');
      } else {
        alert('Ошибка сохранения');
      }
    } catch (error) {
      alert('Ошибка соединения с сервером');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Сброс к значениям по умолчанию
    setSettings({
      telegram: {
        botToken: '',
        chatId: '',
        enabled: false
      },
      bank: {
        bankLink: 'https://app.mbank.kg/qr#',
        megaPayLink: '',
        dengiLink: '',
        balanceLink: '',
        bakaiLink: '',
        demirLink: '',
        optimaLink: ''
      }
    });
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Настройки</h2>
              <p className="text-gray-600 mt-1">
                Управление настройками системы и уведомлений
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Сбросить</span>
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Настройки Telegram бота */}
        <Card className="border-0 shadow-soft mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Telegram бот</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Включить уведомления</label>
                  <p className="text-xs text-gray-500">Отправлять уведомления о заказах в Telegram</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.telegram.enabled}
                    onChange={(e) => handleSettingChange('telegram', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Токен бота
                </label>
                <input
                  type="text"
                  value={settings.telegram.botToken}
                  onChange={(e) => handleSettingChange('telegram', 'botToken', e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Получите токен у @BotFather в Telegram
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID чата
                </label>
                <input
                  type="text"
                  value={settings.telegram.chatId}
                  onChange={(e) => handleSettingChange('telegram', 'chatId', e.target.value)}
                  placeholder="-1001234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID группы или канала для уведомлений
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Настройки MBank */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Настройки MBank</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ссылка MBank
                </label>
                <input
                  type="text"
                  value={settings.bank.bankLink}
                  onChange={(e) => handleSettingChange('bank', 'bankLink', e.target.value)}
                  placeholder="https://app.mbank.kg/qr#"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Базовая ссылка для генерации QR-кодов MBank
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
