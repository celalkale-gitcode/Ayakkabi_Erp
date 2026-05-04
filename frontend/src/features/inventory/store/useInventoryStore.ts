import { create } from 'zustand';

interface ScannedItem {
  sku: string;
  yeniStok: number;
  islemTarihi: string;
}

interface InventoryState {
  scannedItems: ScannedItem[];
  addScannedItem: (item: ScannedItem) => void;
  clearList: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  scannedItems: [],
  addScannedItem: (item) => set((state) => ({ 
    scannedItems: [item, ...state.scannedItems] 
  })),
  clearList: () => set({ scannedItems: [] }),
}));


