const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL tanımlı değil");
}

export const productsApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Next.js için önemli (veri cachelenmesin)
      });

      if (!response.ok) {
        throw new Error(`Ürünler getirilemedi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Hatası:', error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Ürün bulunamadı: ${id}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Hatası:', error);
      return null;
    }
  }
};
