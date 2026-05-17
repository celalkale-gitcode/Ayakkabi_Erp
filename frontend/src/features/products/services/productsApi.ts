import { api } from '@/lib/axios';
// GÜNCELLENDİ: İhtiyacımız olan tip kontratını merkezi dosyadan çekiyoruz
import { Product, ProductPayload } from '../types/product.types';

export const productsApi = {
  // 1. Tüm ürünleri getir
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Ürünler getirilirken API Hatası:', error);
      return [];
    }
  },

  // 2. ID veya Barkod ile ürün getir
  getById: async (id: string): Promise<Product | null> => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ürün (${id}) getirilirken API Hatası:`, error);
      return null;
    }
  },

  // 3. Yeni ürün oluştur
  create: async (payload: ProductPayload): Promise<Product | null> => {
    try {
      const response = await api.post('/products', payload);
      return response.data;
    } catch (error) {
      console.error('Ürün oluşturulurken API Hatası:', error);
      return null;
    }
  },
};
