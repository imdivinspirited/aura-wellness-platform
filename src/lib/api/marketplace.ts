import { apiClient } from './client';

export interface Shop {
  _id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
  contact?: { email?: string; phone?: string; whatsapp?: string; address?: string };
}

export interface Product {
  _id: string;
  shopId: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  stock: number;
  images: string[];
  tags: string[];
  isPublished: boolean;
}

export async function listMarketplaceShops() {
  return apiClient.get<{ success: boolean; data: { shops: Shop[] } }>('/marketplace/shops');
}

export async function listMarketplaceProducts(params?: { shopSlug?: string; q?: string; tag?: string }) {
  const qs = new URLSearchParams();
  if (params?.shopSlug) qs.set('shopSlug', params.shopSlug);
  if (params?.q) qs.set('q', params.q);
  if (params?.tag) qs.set('tag', params.tag);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiClient.get<{ success: boolean; data: { products: Product[] } }>(`/marketplace/products${suffix}`);
}

