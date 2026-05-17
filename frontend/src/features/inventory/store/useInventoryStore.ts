import { create } from 'zustand';
import { ScannedItem } from '../types/inventory.types';

// Aktif raf/konum bilgisini store içinde güvenle tutmak için arayüz
export interface ActiveLocation {
  id: string;
  konumKodu: string; // Örnek: REYON-A-SUTUN-3-KAT-2
  tanimliBeden: string;
  isFull: boolean;
  checkDigit?: string; // GÜNCELLEME: Arayüzdeki checkDigit uyumluluğu için eklendi
}

interface InventoryState {
  scannedItems: ScannedItem[];
  activeLocation: ActiveLocation | null; // El terminalinin o an odaklandığı raf
  
  // Fonksiyonlar
  addScannedItem: (item: Omit<ScannedItem, 'islemTarihi'>) => void;
  setActiveLocation: (location: ActiveLocation | null) => void; 
  markActiveLocationAsFull: () => void; // Lokal state'i anlık "Dolu"ya çekmek için
  clearList: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  scannedItems: [],
  activeLocation: null, // Başlangıçta hiçbir raf seçilmedi

  // Geçmişe taranan ürünü ekler
  addScannedItem: (item) =>
    set((state) => ({
      scannedItems: [
        {
          ...item,
          // Eğer o an bir aktif raf seçiliyse, geçmiş listesinde hangi rafa işlem yapıldığını otomatik bağla
          konumKodu: state.activeLocation?.konumKodu || item.konumKodu,
          islemTarihi: new Date().toISOString(),
        } as ScannedItem,
        ...state.scannedItems,
      ],
    })),

  // Personel raf barkodu okuttuğunda veya seçtiğinde tetiklenir
  setActiveLocation: (location) =>
    set({
      activeLocation: location,
    }),

  // Personel "Raf Doldu" butonuna bastığında API cevabını beklemeden arayüzü anlık günceller
  markActiveLocationAsFull: () =>
    set((state) => ({
      activeLocation: state.activeLocation 
        ? { ...state.activeLocation, isFull: true } 
        : null
    })),

  // Tüm listeyi ve aktif konumu sıfırlar
  clearList: () =>
    set({
      scannedItems: [],
      activeLocation: null,
    }),
}));
