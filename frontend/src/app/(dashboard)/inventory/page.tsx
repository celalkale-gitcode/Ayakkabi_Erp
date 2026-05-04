'use client';
import { useState } from 'react';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';

export default function InventoryPage() {
  const [barcode, setBarcode] = useState('');
  const { scannedItems, addScannedItem } = useInventoryStore();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await inventoryApi.postScan(barcode);
      addScannedItem(result.data);
      setBarcode(''); // Girişi temizle
      alert("Ürün başarıyla sayıldı!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Hata oluştu");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Barkodlu Sayım Ekranı</h1>
      <form onSubmit={handleScan} className="mb-6">
        <input 
          className="border p-2 rounded w-full"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Barkodu okutun veya elle girin..."
          autoFocus
        />
      </form>
      
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="font-semibold mb-2">Son Okutulanlar</h2>
        <ul>
          {scannedItems.map((item, idx) => (
            <li key={idx} className="border-b py-2">
              {item.sku} - Yeni Stok: {item.yeniStok}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

