import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';
import { adminApi } from '../api/admin';

export const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [telegramInfo, setTelegramInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      setAdminUser(JSON.parse(userStr));
    }
    fetchTelegramInfo();
  }, []);

  const fetchTelegramInfo = async () => {
    try {
      setLoading(true);
      const info = await adminApi.getTelegramInfo();
      setTelegramInfo(info);
    } catch (error) {
      console.error('Ошибка получения информации о Telegram боте:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestTelegram = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);
      const result = await adminApi.testTelegramBot();
      setTestResult(result.message);
    } catch (error) {
      console.error('Ошибка тестирования Telegram бота:', error);
      setTestResult('Ошибка отправки тестового сообщения');
    } finally {
      setTestLoading(false);
    }
  };

  if (!adminUser) {
    return <div>Загрузка...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Заголовок */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Настройки</h2>
          <p className="text-gray-600 mt-1">Управление системными настройками</p>
        </div>

        {/* Telegram Bot Settings */}
        <Card className="border-0 shadow-soft mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Telegram Bot</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Статус бота */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {telegramInfo?.isConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    Статус: {telegramInfo?.isConfigured ? 'Настроен' : 'Не настроен'}
                  </span>
                </div>
              </div>

              {/* Информация о боте */}
              {telegramInfo?.isConfigured && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">Chat ID: {telegramInfo.chatId}</span>
                  </div>
                </div>
              )}

              {/* Предупреждение если не настроен */}
              {!telegramInfo?.isConfigured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <Info className="h-4 w-4" />
                    <span className="text-sm">
                      Для настройки Telegram бота установите переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
                    </span>
                  </div>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleTestTelegram}
                  disabled={!telegramInfo?.isConfigured || testLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                >
                  {testLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Отправка...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      <span>Тест Telegram бота</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={fetchTelegramInfo}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Обновить статус</span>
                </Button>
              </div>

              {/* Результат теста */}
              {testResult && (
                <div className={`p-3 rounded-lg ${
                  testResult.includes('Ошибка') 
                    ? 'bg-red-50 border border-red-200 text-red-800' 
                    : 'bg-green-50 border border-green-200 text-green-800'
                }`}>
                  <span className="text-sm">{testResult}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Системная информация */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Системная информация</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Версия приложения:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Среда выполнения:</span>
                <span className="font-medium">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Последнее обновление:</span>
                <span className="font-medium">{new Date().toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
