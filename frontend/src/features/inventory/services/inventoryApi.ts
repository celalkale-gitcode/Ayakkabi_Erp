import { api } from '@/lib/axios';
import { ManualProductPayload } from '../types/inventory.types';

export const inventoryApi = {
  // 1. Barkod Okut ve Stoğu Güncelle (GÜNCELLENDİ: konumId ve miktar parametreleri eklendi)
  scanBarcode: async (barcode: string, miktar: number, konumId: string) => {
    const res = await api.post('/inventory/scan', {
      barkod: barcode,
      miktar: miktar,
      konumId: konumId, // Hangi rafa/konuma ürün eklendiği bilgisi
    });
    return res.data;
  },

  // 2. Manuel Ürün Oluştur ve Stoğu İlgili Rafa Ekle (GÜNCELLENDİ)
  createManualProduct: async (payload: ManualProductPayload) => {
    // payload içerisinde artık 'konumId' de bulunmalı (Types dosyasına eklenmeli)
    const res = await api.post('/inventory/manual-entry', payload);
    return res.data;
  },

  // 3. YENİ: Akıllı Raf Önerisi Al
  // Personel ürün barkodunu okuttuğunda arka planda en uygun boş veya tanımlı rafı döner
  getSuggestedLocation: async (barcode: string) => {
    const res = await api.get(`/inventory/suggest/${barcode}`);
    return res.data; 
    // Dönen Veri: { onerilenKonumId: string, onerilenKonumKodu: string, checkDigit: string }
  },

  // 4. YENİ: Rafı Dolu/Kilitli Olarak İşaretle
  // El terminalindeki "Raf Doldu" butonuna basıldığında tetiklenir
  markShelfAsFull: async (konumId: string) => {
    const res = await api.post('/inventory/shelf-full', {
      konumId,
    });
    return res.data;
  },
};
