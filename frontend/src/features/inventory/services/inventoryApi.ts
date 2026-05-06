import { api } from '@/lib/axios';

export const inventoryApi = {
  scanBarcode: async (barcode: string) => {
    const res = await api.post('/inventory/scan', {
      barkod: barcode,
    });

    return res.data;
  },
};
