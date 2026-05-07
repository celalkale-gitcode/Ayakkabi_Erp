import { api } from '@/lib/axios';

import {
  ManualProductPayload,
} from '../types/inventory.types';

export const inventoryApi = {

  // Barkod okut
  scanBarcode: async (
    barcode: string,
  ) => {

    const res = await api.post(
      '/inventory/scan',
      {
        barkod: barcode,
      },
    );

    return res.data;
  },

  // Manuel ürün oluştur
  createManualProduct: async (
    payload: ManualProductPayload,
  ) => {

    const res = await api.post(
      '/inventory/manual-entry',
      payload,
    );

    return res.data;
  },
};
