'use client';

import { useState, useCallback } from 'react';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import BarcodeScanner from '@/features/inventory/components/BarcodeScanner';

export default function InventoryPage() {
  const [loading, setLoading] = useState(false);
  const { scannedItems, addScannedItem } = useInventoryStore();

  const handleScan = useCallback(async (barcode: string) => {
    if (loading) return;

    setLoading(true);

    try {
      const result = await inventoryApi.scanBarcode(barcode);

      if (result) {
        addScannedItem(result);

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    } catch (err: any) {
      console.error("Barkod hatası:", err?.message);
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  }, [loading, addScannedItem]);

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold text-center">
        Mobil Stok Sayımı
      </h1>

      <BarcodeScanner onScan={handleScan} />

      {loading && (
        <div className="text-center text-blue-600 animate-pulse font-medium">
          İşleniyor...
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-4">
        <h2 className="font-semibold border-b pb-2 mb-3">
          Son Sayımlar
        </h2>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {scannedItems.map((item, idx) => (
            <div
              key={item.sku + idx}
              className="flex justify-between items-center p-2 bg-slate-50 rounded border"
            >
              <div>
                <p className="font-bold text-sm">{item.sku}</p>
                <p className="text-xs text-gray-500">
                  {item.islemTarihi
                    ? new Date(item.islemTarihi).toLocaleTimeString()
                    : "-"}
                </p>
              </div>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                Stok: {item.yeniStok}
              </span>
            </div>
          ))}

          {scannedItems.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">
              Henüz barkod okutulmadı.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
