import { create } from 'zustand';

interface InventoryState {
  scannedItems: any[];
  addScannedItem: (item: any) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  scannedItems: [],
  addScannedItem: (item) => set((state) => ({ 
    scannedItems: [item, ...state.scannedItems] 
  })),
}));

