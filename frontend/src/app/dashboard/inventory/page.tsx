'use client';

import { useState } from 'react';

import BarkodScanner from '@/features/inventory/components/BarcodeScanner';
import ScanHistoryList from '@/features/inventory/components/ScanHistoryList';
import ManualProductModal from '@/features/inventory/components/ManualProductModal';

import { ScannedItem } from '@/features/inventory/types/inventory.types';

export default function InventoryPage() {
  const [barcode, setBarcode] = useState('');
  const [history, setHistory] = useState<ScannedItem[]>([]);
  const [showManualModal, setShowManualModal] = useState(false);

  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const handleBarcode = async (code: string) => {
    setBarcode(code);

    if (lastScanned === code) return;

    setLastScanned(code);

    const newItem: ScannedItem = {
      sku: code,
      yeniStok: Math.floor(Math.random() * 100),
      islemTarihi: new Date().toISOString(),
    };

    setHistory((prev) => [newItem, ...prev]);

    setTimeout(() => {
      setLastScanned(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="p-4">
          <h1 className="text-2xl font-black text-slate-900">
            Mobil Stok Sayım
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* SCANNER */}
        <BarkodScanner onResult={handleBarcode} />

        {/* OKUNAN BARKOD */}
        <div className="bg-white rounded-3xl shadow-sm border p-5">
          <p className="text-sm font-semibold text-slate-500">
            Okunan Barkod :
          </p>

          <div className="mt-3 rounded-2xl bg-slate-50 border p-4">
            {barcode ? (
              <p className="text-xl font-black text-blue-600 tracking-wider break-all">
                {barcode}
              </p>
            ) : (
              <p className="text-slate-400">
                Henüz barkod okunmadı
              </p>
            )}
          </div>
        </div>

        {/* SON TARANANLAR */}
        <div className="bg-white rounded-3xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900">
              Son Tarananlar :
            </h2>

            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {history.length}
            </span>
          </div>

          <ScanHistoryList items={history} />
        </div>
      </div>

      {/* MANUEL ÜRÜN EKLE */}
      {showManualModal && (
        <ManualProductModal
          barkod={barcode}
          onClose={() => setShowManualModal(false)}
          onSubmit={(data) => {
            console.log(data);
            setShowManualModal(false);
          }}
        />
      )}
    </div>
  );
}
