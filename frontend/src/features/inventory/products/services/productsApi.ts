// src/features/products/services/productsApi.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ayakkabi-erp.onrender.com/api/v1';

export const productsApi = {
  // Tüm ürünleri getiren fonksiyon
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ürünler getirilemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('API Hatası:', error);
      return []; // Hata durumunda boş liste dön ki sayfa çökmesin
    }
  },

  // Tek bir ürün detayı için (ihtiyaç olursa)
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return await response.json();
  }
};

