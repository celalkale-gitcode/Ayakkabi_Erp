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

    setTimeout(() => setLastScanned(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-black text-slate-900">
            Mobil Stok Sayım
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 w-full max-w-md mx-auto px-2 py-3 space-y-4">

        {/* SCANNER FULL WIDTH FEEL */}
        <div className="w-full">
          <BarkodScanner onResult={handleBarcode} />
        </div>

        {/* OKUNAN BARKOD */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <p className="text-xs font-semibold text-slate-500">
            Okunan Barkod
          </p>

          <div className="mt-2 bg-slate-50 border rounded-xl p-3">
            {barcode ? (
              <p className="text-lg font-black text-blue-600 break-all">
                {barcode}
              </p>
            ) : (
              <p className="text-slate-400 text-sm">
                Henüz barkod okunmadı
              </p>
            )}
          </div>
        </div>

        {/* HISTORY */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-black text-slate-900">
              Son Tarananlar
            </h2>

            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
              {history.length}
            </span>
          </div>

          <ScanHistoryList items={history} />
        </div>

      </div>

      {/* MANUAL MODAL */}
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
