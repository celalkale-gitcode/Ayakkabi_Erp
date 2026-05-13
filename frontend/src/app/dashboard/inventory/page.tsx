'use client';

import React, { useState } from 'react';

export default function InventoryPage() {
  const [amount, setAmount] = useState<string>('45');

  // Miktar buton fonksiyonları
  const handleAdd = (value: number) => {
    const current = parseInt(amount) || 0;
    setAmount((current + value).toString());
  };

  const handleClear = () => setAmount('');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 font-sans selection:bg-emerald-500/30">
      {/* Üst Bar / Navigasyon */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">≡</span>
          <h1 className="text-lg font-semibold tracking-wide">Mobil Stok Sayım</h1>
        </div>
        <span className="text-sm text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
          Depo: A
        </span>
      </div>

      {/* Sayım Ekranı Başlığı */}
      <h2 className="text-sm font-medium text-neutral-400 mb-2 px-1">Sayım Ekranı</h2>

      {/* Kamera / Barkod Alanı Simülasyonu */}
      <div className="relative aspect-[16/9] w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
        <div className="text-center p-4 border-2 border-dashed border-neutral-700 rounded-lg max-w-[80%]">
          <p className="text-xs text-neutral-500 font-mono">SKU: STK-45678</p>
          <div className="h-10 w-40 bg-[url('unsplash.com')] bg-cover opacity-40 mx-auto my-2 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-600 shadow-[0_0_8px_#dc2626]"></div>
          </div>
        </div>
      </div>

      {/* Sekmeler (Tabs) */}
      <div className="flex border-b border-neutral-950 mb-4 text-xs font-medium text-neutral-400">
        <button className="flex-1 pb-2 text-center border-b-2 border-transparent">Barkod Tara</button>
        <button className="flex-1 pb-2 text-center border-b-2 border-emerald-500 text-emerald-400 font-bold">Ürün Detayı</button>
        <button className="flex-1 pb-2 text-center border-b-2 border-transparent">Adet Giriniz</button>
      </div>

      {/* ─── 1 NOLU ALAN: ÜRÜN DETAY KARTI ─── */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 shadow-xl space-y-2.5 mb-4">
        <div>
          <span className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase block">Ürün Adı</span>
          <p className="text-sm font-semibold text-neutral-200">LED PANEL - 24W (PHILIPS)</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-800/50">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase block">Lokasyon</span>
            <p className="text-xs font-medium text-neutral-300">A-12-04</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase block">Raf</span>
            <p className="text-xs font-medium text-neutral-300">03</p>
          </div>
        </div>
      </div>

      {/* ─── 2 NOLU ALAN: MİKTAR GİRİŞ VE AKSİYON KARTI ─── */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-medium">Mevcut Stok:</span>
          <span className="text-sm font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-0.5 rounded-md">
            42 Adet
          </span>
        </div>

        {/* Input Alanı */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase block">
            Miktar Girin
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 px-4 text-center text-lg font-bold font-mono text-neutral-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="0"
          />
        </div>

        {/* Hızlı Butonlar */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAdd(1)}
            className="bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 py-2.5 rounded-lg text-sm font-semibold transition-colors border border-neutral-700/40"
          >
            +1
          </button>
          <button
            onClick={() => handleAdd(10)}
            className="bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 py-2.5 rounded-lg text-sm font-semibold transition-colors border border-neutral-700/40"
          >
            +10
          </button>
          <button
            onClick={handleClear}
            className="bg-neutral-800/50 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 py-2.5 rounded-lg text-sm font-semibold transition-colors border border-transparent hover:border-red-900/50"
          >
            Sil
          </button>
        </div>

        {/* Ana Onay Butonu */}
        <button className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-neutral-950 font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-emerald-900/20 tracking-wide text-sm mt-2">
          ONAYLA
        </button>
      </div>
    </div>
  );
}
