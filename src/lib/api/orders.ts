import { apiClient } from './client';

export interface OrderAddress {
  fullName: string;
  email?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export async function marketplaceCheckout(input: {
  shippingAddress: OrderAddress;
  promoCode?: string;
  paymentProvider?: 'razorpay' | 'stripe' | 'paypal' | 'manual';
}) {
  return apiClient.post('/marketplace/checkout', input, { requireAuth: true });
}

export async function listMyOrders() {
  return apiClient.get('/marketplace/orders', { requireAuth: true });
}

