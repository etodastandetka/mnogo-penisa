import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../store/cartStore';
import { ordersApi } from '../utils/api';

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    paymentMethod: 'cash' as 'cash' | 'online',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    // Валидация
    if (!formData.customerName.trim()) {
      Alert.alert('Ошибка', 'Введите ваше имя');
      return;
    }
    if (!formData.customerPhone.trim()) {
      Alert.alert('Ошибка', 'Введите номер телефона');
      return;
    }
    if (!formData.deliveryAddress.trim()) {
      Alert.alert('Ошибка', 'Введите адрес доставки');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        paymentMethod: formData.paymentMethod,
        totalAmount: getTotalPrice(),
      };

      const response = await ordersApi.createOrder(orderData);
      
      Alert.alert(
        'Заказ оформлен!',
        `Номер заказа: ${response.orderNumber}\nМы свяжемся с вами в ближайшее время.`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              navigation.navigate('Home' as never);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      Alert.alert('Ошибка', 'Не удалось оформить заказ. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${price} ₽`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оформление заказа</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ваш заказ</Text>
          <View style={styles.orderItems}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.product.name}</Text>
                  <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  {formatPrice(item.product.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalPrice}>{formatPrice(getTotalPrice())}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контактная информация</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Имя *</Text>
            <TextInput
              style={styles.input}
              value={formData.customerName}
              onChangeText={(value) => handleInputChange('customerName', value)}
              placeholder="Введите ваше имя"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Телефон *</Text>
            <TextInput
              style={styles.input}
              value={formData.customerPhone}
              onChangeText={(value) => handleInputChange('customerPhone', value)}
              placeholder="+996 XXX XXX XXX"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Адрес доставки *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.deliveryAddress}
              onChangeText={(value) => handleInputChange('deliveryAddress', value)}
              placeholder="Введите адрес доставки"
              placeholderTextColor="#9ca3af"
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
              formData.paymentMethod === 'cash' && styles.paymentOptionActive
            ]}
            onPress={() => handleInputChange('paymentMethod', 'cash')}
          >
            <Ionicons 
              name={formData.paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={formData.paymentMethod === 'cash' ? '#dc2626' : '#9ca3af'} 
            />
            <View style={styles.paymentOptionInfo}>
              <Text style={styles.paymentOptionTitle}>Наличными</Text>
              <Text style={styles.paymentOptionDescription}>
                Оплата при получении заказа
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'online' && styles.paymentOptionActive
            ]}
            onPress={() => handleInputChange('paymentMethod', 'online')}
          >
            <Ionicons 
              name={formData.paymentMethod === 'online' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={formData.paymentMethod === 'online' ? '#dc2626' : '#9ca3af'} 
            />
            <View style={styles.paymentOptionInfo}>
              <Text style={styles.paymentOptionTitle}>Онлайн оплата</Text>
              <Text style={styles.paymentOptionDescription}>
                Оплата картой или через мобильный банк
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmitOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Оформить заказ</Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentOptionActive: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  paymentOptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../store/cartStore';
import { ordersApi } from '../utils/api';

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    paymentMethod: 'cash' as 'cash' | 'online',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    // Валидация
    if (!formData.customerName.trim()) {
      Alert.alert('Ошибка', 'Введите ваше имя');
      return;
    }
    if (!formData.customerPhone.trim()) {
      Alert.alert('Ошибка', 'Введите номер телефона');
      return;
    }
    if (!formData.deliveryAddress.trim()) {
      Alert.alert('Ошибка', 'Введите адрес доставки');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        paymentMethod: formData.paymentMethod,
        totalAmount: getTotalPrice(),
      };

      const response = await ordersApi.createOrder(orderData);
      
      Alert.alert(
        'Заказ оформлен!',
        `Номер заказа: ${response.orderNumber}\nМы свяжемся с вами в ближайшее время.`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              navigation.navigate('Home' as never);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      Alert.alert('Ошибка', 'Не удалось оформить заказ. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${price} ₽`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оформление заказа</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ваш заказ</Text>
          <View style={styles.orderItems}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.product.name}</Text>
                  <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  {formatPrice(item.product.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalPrice}>{formatPrice(getTotalPrice())}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контактная информация</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Имя *</Text>
            <TextInput
              style={styles.input}
              value={formData.customerName}
              onChangeText={(value) => handleInputChange('customerName', value)}
              placeholder="Введите ваше имя"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Телефон *</Text>
            <TextInput
              style={styles.input}
              value={formData.customerPhone}
              onChangeText={(value) => handleInputChange('customerPhone', value)}
              placeholder="+996 XXX XXX XXX"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Адрес доставки *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.deliveryAddress}
              onChangeText={(value) => handleInputChange('deliveryAddress', value)}
              placeholder="Введите адрес доставки"
              placeholderTextColor="#9ca3af"
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
              formData.paymentMethod === 'cash' && styles.paymentOptionActive
            ]}
            onPress={() => handleInputChange('paymentMethod', 'cash')}
          >
            <Ionicons 
              name={formData.paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={formData.paymentMethod === 'cash' ? '#dc2626' : '#9ca3af'} 
            />
            <View style={styles.paymentOptionInfo}>
              <Text style={styles.paymentOptionTitle}>Наличными</Text>
              <Text style={styles.paymentOptionDescription}>
                Оплата при получении заказа
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'online' && styles.paymentOptionActive
            ]}
            onPress={() => handleInputChange('paymentMethod', 'online')}
          >
            <Ionicons 
              name={formData.paymentMethod === 'online' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={formData.paymentMethod === 'online' ? '#dc2626' : '#9ca3af'} 
            />
            <View style={styles.paymentOptionInfo}>
              <Text style={styles.paymentOptionTitle}>Онлайн оплата</Text>
              <Text style={styles.paymentOptionDescription}>
                Оплата картой или через мобильный банк
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmitOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Оформить заказ</Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentOptionActive: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  paymentOptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
