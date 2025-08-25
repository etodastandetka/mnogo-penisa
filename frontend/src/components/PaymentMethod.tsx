import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { CreditCard, QrCode, DollarSign, Receipt, Building2, Wallet, Smartphone, Users } from 'lucide-react';

interface PaymentMethodProps {
  totalAmount: number;
  onPaymentComplete: (paymentData: any) => void;
}

interface BankApp {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const bankApps: BankApp[] = [
  { name: 'Megapay', url: 'https://megapay.kg/get#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a', icon: Building2 },
  { name: 'Balance.kg', url: 'https://balance.kg/#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a', icon: Wallet },
  { name: 'Demirbank', url: 'https://apps.demirbank.kg/ib/#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a', icon: Building2 },
  { name: 'O!Dengi', url: 'https://api.dengi.o.kg/ru/qr/#00020101021132670013QR00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a', icon: Smartphone },
  { name: 'Bakai', url: 'https://bakai24.app/#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a', icon: Building2 },
  { name: 'Companion', url: 'https://payqr.kg/qr/#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a', icon: Users },
  { name: 'Mbank', url: 'https://app.mbank.kg/qr/#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a', icon: Smartphone }
];

const qrCodeUrl = 'https://payqr.kg/qr/#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a';

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ totalAmount, onPaymentComplete }) => {
  const [cashAmount, setCashAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paymentNote, setPaymentNote] = useState('');
  const [activeTab, setActiveTab] = useState('card');

  const handleBankPayment = (bankUrl: string) => {
    window.open(bankUrl, '_blank');
    // Показываем форму для загрузки чека
    setPaymentNote('Оплатите через приложение и загрузите чек');
  };

  const handleQRPayment = () => {
    setPaymentNote('Отсканируйте QR-код и загрузите чек');
  };

  const handleCashPayment = () => {
    const change = parseFloat(cashAmount) - totalAmount;
    if (change >= 0) {
      setPaymentNote(`Сдача: ${change.toFixed(2)} сом`);
    } else {
      setPaymentNote('Недостаточно средств');
    }
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleSubmitPayment = () => {
    if (!receiptFile && paymentNote !== 'Недостаточно средств') {
      alert('Пожалуйста, загрузите чек');
      return;
    }

    const paymentData = {
      method: paymentNote.includes('QR') ? 'QR' : paymentNote.includes('Сдача') ? 'Cash' : 'Bank',
      amount: totalAmount,
      receipt: receiptFile,
      note: paymentNote,
      timestamp: new Date().toISOString()
    };

    onPaymentComplete(paymentData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Способ оплаты
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card">Карта</TabsTrigger>
            <TabsTrigger value="qr">QR-код</TabsTrigger>
            <TabsTrigger value="cash">Наличные</TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {bankApps.map((bank) => (
                <Button
                  key={bank.name}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleBankPayment(bank.url)}
                >
                  <bank.icon className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium">{bank.name}</span>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Отсканируйте QR-код для оплаты
              </p>
              <Button onClick={handleQRPayment} className="mt-4">
                <QrCode className="w-4 h-4 mr-2" />
                Оплатить через QR
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cash" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="cash-amount">Сумма к оплате: {totalAmount} сом</Label>
                <Input
                  id="cash-amount"
                  type="number"
                  placeholder="Введите полученную сумму"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleCashPayment} className="w-full">
                <DollarSign className="w-4 h-4 mr-2" />
                Рассчитать сдачу
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {paymentNote && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">{paymentNote}</p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="receipt">Загрузить чек (если требуется)</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={handleReceiptUpload}
              className="mt-2"
            />
          </div>

          <Button 
            onClick={handleSubmitPayment}
            className="w-full"
            disabled={!receiptFile && !paymentNote.includes('Сдача')}
          >
            <Receipt className="w-4 h-4 mr-2" />
            Подтвердить оплату
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
