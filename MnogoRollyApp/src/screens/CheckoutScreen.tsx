import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { ordersApi } from '../utils/api';
import { PaymentMethod } from '../types';
import Toast from 'react-native-toast-message';

const CheckoutScreen = ({ navigation }: any) => {
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useUserStore();
  
  const [customerData, setCustomerData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.ONLINE);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!customerData.name || !customerData.phone || !customerData.address) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerName: customerData.name,
        customerPhone: customerData.phone,
        customerEmail: customerData.email,
        deliveryAddress: customerData.address,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: getTotal(),
        paymentMethod,
        userId: isAuthenticated ? user?.id : null
      };

      const response = isAuthenticated 
        ? await ordersApi.create(orderData)
        : await ordersApi.createGuest(orderData);

      if (response.data) {
        clearCart();
        Toast.show({
          type: 'success',
          text1: 'Заказ оформлен!',
          text2: `Номер заказа: ${response.data.orderNumber}`,
        });
        
        if (paymentMethod === PaymentMethod.ONLINE) {
          navigation.navigate('Payment', { order: response.data });
        } else {
          navigation.navigate('OrderSuccess', { order: response.data });
        }
      }
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      Alert.alert('Ошибка', 'Не удалось оформить заказ. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <LinearGradient
          colors={['#dc2626', '#ea580c', '#f59e0b']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Оформление заказа</Text>
            <View style={{ width: 30 }} />
          </View>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptyText}>
            Добавьте товары в корзину для оформления заказа
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.continueButtonText}>Перейти к меню</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#dc2626', '#ea580c', '#f59e0b']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Оформление заказа</Text>
          <View style={{ width: 30 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контактная информация</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Имя *</Text>
            <TextInput
              style={styles.input}
              value={customerData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Введите ваше имя"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Телефон *</Text>
            <TextInput
              style={styles.input}
              value={customerData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="+996 XXX XXX XXX"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={customerData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="email@example.com"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Адрес доставки *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={customerData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Введите адрес доставки"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Способ оплаты</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === PaymentMethod.ONLINE && styles.paymentOptionSelected
            ]}
            onPress={() => setPaymentMethod(PaymentMethod.ONLINE)}
          >
            <Text style={styles.paymentIcon}>💳</Text>
            <Text style={styles.paymentLabel}>Онлайн оплата</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === PaymentMethod.CASH && styles.paymentOptionSelected
            ]}
            onPress={() => setPaymentMethod(PaymentMethod.CASH)}
          >
            <Text style={styles.paymentIcon}>💵</Text>
            <Text style={styles.paymentLabel}>Наличными</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ваш заказ</Text>
          
          {items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.product.name}</Text>
                <Text style={styles.orderItemQuantity}>
                  {item.quantity} × {item.product.price} сом
                </Text>
              </View>
              <Text style={styles.orderItemTotal}>
                {item.quantity * item.product.price} сом
              </Text>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalAmount}>{getTotal()} сом</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Оформление...' : `Оформить заказ за ${getTotal()} сом`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  orderItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
