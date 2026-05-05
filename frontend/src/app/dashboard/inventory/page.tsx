'use client';
import { useState } from 'react';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import BarcodeScanner from '@/features/inventory/components/BarcodeScanner';

export default function InventoryPage() {
  const [loading, setLoading] = useState(false);
  const { scannedItems, addScannedItem } = useInventoryStore();

  const handleScan = async (barcode: string) => {
    if (loading) return; // Çift okumayı engelle

    setLoading(true);
    try {
      const result = await inventoryApi.scanBarcode(barcode);
      addScannedItem(result); 
      
      // Telefon titretme (Haptic Feedback) - Kullanıcıya bildirim için harika olur
      if (navigator.vibrate) navigator.vibrate(100);
      
    } catch (err: any) {
      console.error("Barkod hatası:", err.response?.data?.message);
    } finally {
      // Bir sonraki okuma için 1.5 saniye bekle (Art arda aynı ürünü okumaması için)
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold text-center">Mobil Stok Sayımı</h1>
      
      {/* Kamera Modülü */}
      <BarcodeScanner onScan={handleScan} />

      {/* Durum Göstergesi */}
      {loading && (
        <div className="text-center text-blue-600 animate-pulse font-medium">
          İşleniyor...
        </div>
      )}

      {/* Son Okutulanlar Listesi */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h2 className="font-semibold border-b pb-2 mb-3">Son Sayımlar</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {scannedItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
              <div>
                <p className="font-bold text-sm">{item.sku}</p>
                <p className="text-xs text-gray-500">{new Date(item.islemTarihi).toLocaleTimeString()}</p>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                Stok: {item.yeniStok}
              </span>
            </div>
          ))}
          {scannedItems.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">Henüz barkod okutulmadı.</p>
          )}
        </div>
      </div>
    </div>
  );
}
