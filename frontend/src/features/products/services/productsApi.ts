import { api } from '@/lib/axios';

// İleride types dosyasına taşınabilir, şimdilik tip güvenliği için buraya ekledik
export interface ProductPayload {
  barkod: string;
  urunAdi: string;
  marka?: string;
  renk: string;
  beden: string;
  sku: string;
  fiyat?: number;
}

export const productsApi = {
  // 1. Tüm ürünleri getir
  getAll: async () => {
    try {
      // axios instance otomatik olarak base URL ve 'Content-Type' ayarlarını yönetir
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Ürünler getirilirken API Hatası:', error);
      return [];
    }
  },

  // 2. ID veya Barkod ile ürün getir
  getById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ürün (${id}) getirilirken API Hatası:`, error);
      return null;
    }
  },

  // 3. Yeni ürün oluştur (payload 'any' tipinden kurtarıldı)
  create: async (payload: ProductPayload) => {
    try {
      const response = await api.post('/products', payload);
      return response.data;
    } catch (error) {
      console.error('Ürün oluşturulurken API Hatası:', error);
      return null;
    }
  },
};
