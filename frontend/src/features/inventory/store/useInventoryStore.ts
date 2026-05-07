import { create } from 'zustand';

import {
  ScannedItem,
} from '../types/inventory.types';

interface InventoryState {
  scannedItems: ScannedItem[];

  addScannedItem: (
    item: ScannedItem,
  ) => void;

  clearList: () => void;
}

export const useInventoryStore =
  create<InventoryState>((set) => ({

    scannedItems: [],

    addScannedItem: (item) =>
      set((state) => ({
        scannedItems: [
          {
            ...item,
            islemTarihi:
              new Date().toISOString(),
          },

          ...state.scannedItems,
        ],
      })),

    clearList: () =>
      set({
        scannedItems: [],
      }),
  }));
