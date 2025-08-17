import React, { useState } from 'react';
import { Button } from './ui/Button';
import { 
  ExternalLink
} from 'lucide-react';
import { generateBankLinks } from '../utils/paymentUtils';

interface BankPaymentButtonsProps {
  amount: number;
  orderNumber: string;
  customerPhone?: string;
  customerName?: string;
}

interface BankInfo {
  name: string;
  url: string;
  qrHash: string;
  fullLink: string;
}

export const BankPaymentButtons: React.FC<BankPaymentButtonsProps> = ({
  amount,
  orderNumber,
  customerPhone,
  customerName
}) => {
  const [bankLinks, setBankLinks] = useState<Record<string, BankInfo>>({});

  // Генерируем ссылки для всех банков при загрузке
  React.useEffect(() => {
    const links = generateBankLinks(amount, orderNumber);
    setBankLinks(links);
  }, [amount, orderNumber]);



  // Функция открытия ссылки в новом окне
  const openBankLink = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // Логотипы для разных банков
  const getBankLogo = (bankCode: string) => {
    switch (bankCode) {
      case 'dengi':
        return <img src="/images/banks/dengi.svg" alt="О! Деньги" className="w-6 h-6" />;
      case 'bakai':
        return <img src="/images/banks/bakai.svg" alt="Bakai" className="w-6 h-6" />;
      case 'balance':
        return <img src="/images/banks/balance.svg" alt="Balance.kg" className="w-6 h-6" />;
      case 'megapay':
        return <img src="/images/banks/megapay.svg" alt="MegaPay" className="w-6 h-6" />;
      case 'mbank':
        return <img src="/images/banks/mbank.svg" alt="MBank" className="w-6 h-6" />;
      case 'demirbank':
        return <img src="/images/banks/demirbank.svg" alt="Demirbank" className="w-6 h-6" />;
      case 'companion':
        return <img src="/images/banks/companion.svg" alt="Companion" className="w-6 h-6" />;
      default:
        return <img src="/images/banks/mbank.svg" alt="Bank" className="w-6 h-6" />;
    }
  };



  if (Object.keys(bankLinks).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Загрузка способов оплаты...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Выберите способ оплаты
        </h3>
        <p className="text-gray-600">
          Сумма к оплате: <span className="font-semibold text-red-600">{amount} сом</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Номер заказа: {orderNumber}
        </p>

      </div>

      {/* Кнопки банков */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {Object.entries(bankLinks).map(([bankCode, bankInfo]) => (
          <div 
            key={bankCode} 
            className="bg-white rounded-lg p-3 border border-gray-200 shadow-soft hover:shadow-md transition-all duration-300 cursor-pointer group"
            onClick={() => openBankLink(bankInfo.fullLink)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-2 border border-gray-200">
                {getBankLogo(bankCode)}
              </div>
              
              <h4 className="font-medium text-gray-900 text-xs mb-2">
                {bankInfo.name}
              </h4>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  openBankLink(bankInfo.fullLink);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xs py-1.5"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Оплатить
              </Button>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};
