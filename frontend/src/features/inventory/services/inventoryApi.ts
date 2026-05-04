import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

export const inventoryApi = {
  postScan: async (barkod: string, miktar: number = 1) => {
    const response = await api.post('/inventory/scan', { barkod, miktar });
    return response.data;
  }
};

