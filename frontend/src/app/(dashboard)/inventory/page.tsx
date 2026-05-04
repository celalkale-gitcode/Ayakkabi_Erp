'use client';
import { useState, useRef } from 'react';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';

export default function InventoryPage() {
  const [barkod, setBarkod] = useState('');
  const [loading, setLoading] = useState(false);
  const { scannedItems, addScannedItem } = useInventoryStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barkod) return;

    setLoading(true);
    try {
      const res = await inventoryApi.scanBarcode(barkod);
      addScannedItem(res); // Backend'den gelen: { sku, yeniStok, islemTarihi }
      setBarkod('');
      inputRef.current?.focus();
    } catch (err: any) {
      alert(err.response?.data?.message || "Barkod okunamadı!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Barkodlu Ürün Sayımı</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          ref={inputRef}
          type="text"
          className="w-full p-4 border-2 border-blue-500 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Barkodu okutun..."
          value={barkod}
          onChange={(e) => setBarkod(e.target.value)}
          autoFocus
          disabled={loading}
        />
      </form>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">SKU</th>
              <th className="p-4">Yeni Stok</th>
              <th className="p-4">İşlem Saati</th>
            </tr>
          </thead>
          <tbody>
            {scannedItems.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{item.sku}</td>
                <td className="p-4 text-green-600 font-bold">{item.yeniStok}</td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(item.islemTarihi).toLocaleTimeString()}
                </td>
              </tr>
            ))}
            {scannedItems.length === 0 && (
              <tr>
                <td colSpan={3} className="p-10 text-center text-gray-400">
                  Henüz barkod okutulmadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
