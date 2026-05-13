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
  const [showSelectionModal, setShowSelectionModal] = useState(false); // Yeni 3'lü menü için state
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const handleBarcode = async (code: string) => {
    setBarcode(code);

    if (lastScanned === code) return;
    setLastScanned(code);
    setTimeout(() => setLastScanned(null), 2000);

    // Ürünün listede olup olmadığını kontrol et
    const existingItemIndex = history.findIndex((item) => item.sku === code);

    if (existingItemIndex !== -1) {
      // DURUM A: Ürün varsa stoğu +1 artır ve listenin başına taşı
      setHistory((prev) => {
        const updatedHistory = [...prev];
        const currentItem = updatedHistory[existingItemIndex];
        
        updatedHistory[existingItemIndex] = {
          ...currentItem,
          yeniStok: currentItem.yeniStok + 1,
          islemTarihi: new Date().toISOString(),
        };

        const [movedItem] = updatedHistory.splice(existingItemIndex, 1);
        return [movedItem, ...updatedHistory];
      });
    } else {
      // DURUM B: Ürün yoksa 3 seçenekli Modal Menüyü aç
      setShowSelectionModal(true);
    }
  };

  // Yeni Ürün Ekleme Fonksiyonu (Listeye 1 stokla kaydeder)
  const handleAddNewProduct = () => {
    const newItem: ScannedItem = {
      sku: barcode,
      yeniStok: 1,
      islemTarihi: new Date().toISOString(),
    };
    setHistory((prev) => [newItem, ...prev]);
    setShowSelectionModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-black text-slate-900">Mobil Stok Sayım</h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 w-full max-w-md mx-auto px-2 py-3 space-y-4">
        {/* SCANNER */}
        <div className="w-full">
          <BarkodScanner onResult={handleBarcode} />
        </div>

        {/* OKUNAN BARKOD */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <p className="text-xs font-semibold text-slate-500">Okunan Barkod</p>
          <div className="mt-2 bg-slate-50 border rounded-xl p-3">
            {barcode ? (
              <p className="text-lg font-black text-blue-600 break-all">{barcode}</p>
            ) : (
              <p className="text-slate-400 text-sm">Henüz barkod okunmadı</p>
            )}
          </div>
        </div>

        {/* HISTORY */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-black text-slate-900">Son Tarananlar</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
              {history.length}
            </span>
          </div>
          <ScanHistoryList items={history} />
        </div>
      </div>

      {/* 3 SEÇENEKLİ SEÇİM MODAL MENÜSÜ */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3 className="text-base font-black text-slate-900">Ürün Bulunamadı</h3>
              <p className="text-xs text-slate-500 mt-1 break-all">
                <span className="font-mono font-bold text-slate-700">{barcode}</span> barkodlu ürün sistemde kayıtlı değil.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {/* 1. Yeni Ürün Ekle */}
              <button
                onClick={handleAddNewProduct}
                className="w-full bg-blue-600 active:scale-95 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm shadow-blue-200"
              >
                1. Yeni Ürün Ekle
              </button>

              {/* 2. Tekrar Tara */}
              <button
                onClick={() => setShowSelectionModal(false)}
                className="w-full bg-slate-100 active:scale-95 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all border border-slate-200"
              >
                2. Tekrar Tara
              </button>

              {/* 3. Manuel Ekle */}
              <button
                onClick={() => {
                  setShowSelectionModal(false);
                  setShowManualModal(true);
                }}
                className="w-full bg-white active:scale-95 text-blue-600 py-3 rounded-xl font-bold text-sm transition-all border border-blue-200"
              >
                3. Manuel Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUEL EKLEME DETAY MODALİ */}
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
