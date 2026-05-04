import { api } from '@/lib/axios';

export const productsApi = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
};


