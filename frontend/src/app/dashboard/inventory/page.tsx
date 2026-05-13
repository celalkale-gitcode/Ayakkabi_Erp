'use client';

import React, { useState } from 'react';

export default function InventoryPage() {
  const [miktar, setMiktar] = useState<string>('45');

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans antialiased select-none flex flex-col justify-between pb-8">
      <div>
        {/* Üst Başlık Barı */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-[#1a1a1a]">
          <div className="flex items-center gap-4">
            {/* Hamburger Menü İkon Çizgileri */}
            <div className="flex flex-col gap-1.5 cursor-pointer py-1">
              <div className="w-5 h-[2px] bg-white"></div>
              <div className="w-5 h-[2px] bg-white"></div>
              <div className="w-5 h-[2px] bg-white"></div>
            </div>
            <h1 className="text-[17px] font-normal tracking-wide">Mobil Stok Sayım</h1>
          </div>
          <span className="text-[14px] font-normal text-zinc-300">Depo: A</span>
        </div>

        {/* Ekran Alt Başlığı */}
        <div className="px-4 py-3">
          <p className="text-[14px] text-zinc-400 font-normal">Sayım Ekranı</p>
        </div>

        {/* Kamera / Barkod Tarama Bölümü */}
        <div className="px-4 mb-4">
          <div className="relative w-full aspect-[4/3] bg-[#1a1a1a] rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
            {/* Kamera Görüntüsü Yer Tutucu (Görseldeki kutu resmi simülasyonu) */}
            <div className="w-[85%] bg-zinc-200 p-4 rounded shadow-md text-black flex flex-col items-center justify-center relative">
              {/* Kamera İkonu (Sağ Üst) */}
              <div className="absolute top-2 right-2 text-zinc-600 text-sm">📷</div>
              
              <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-700 mb-1">SKU: STK-45678</span>
              <div className="w-full h-14 bg-zinc-300 flex items-center justify-center relative my-1">
                {/* Barkod Çizgileri */}
                <span className="text-3xl tracking-[2px] font-serif text-zinc-800 select-none">||||| | |||| ||| ||</span>
                {/* Kırmızı Lazer Çizgisi */}
                <div className="absolute w-full h-[1.5px] bg-red-600 shadow-[0_0_4px_rgba(220,38,38,0.8)] top-1/2 left-0"></div>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-600">8 027475 45678</span>
              
              {/* Kare Hedef İşareti (Sağ Alt) */}
              <div className="absolute bottom-2 right-2 text-zinc-600 text-xs font-bold">[ ]</div>
            </div>
          </div>
        </div>

        {/* Menü Sekmeleri */}
        <div className="grid grid-cols-3 border-b border-zinc-900 text-[13px] font-normal text-zinc-400 px-2 mb-4">
          <button className="pb-2.5 text-center">Barkod Tara</button>
          <button className="pb-2.5 text-center text-zinc-200 border-b-2 border-zinc-400 font-medium">Ürün Detayı</button>
          <button className="pb-2.5 text-center">Adet Giriniz</button>
        </div>

        {/* Ana İçerik Alanı */}
        <div className="px-4 space-y-3">
          
          {/* ─── 1 NOLU ALAN: ÜRÜN DETAY KUTUSU ─── */}
          <div className="bg-[#1c1c1e] border border-zinc-800/80 rounded-xl p-4 space-y-2 shadow-lg">
            <div className="text-[14px] font-medium tracking-wide text-zinc-100">
              ÜRÜN ADI: <span className="text-zinc-300 font-normal">LED PANEL - 24W (PHILIPS)</span>
            </div>
            <div className="text-[14px] font-medium tracking-wide text-zinc-100">
              Lokasyon: <span className="text-zinc-300 font-normal">A-12-04</span>
            </div>
            <div className="text-[14px] font-medium tracking-wide text-zinc-100">
              Raf: <span className="text-zinc-300 font-normal">03</span>
            </div>
          </div>

          {/* ─── 2 NOLU ALAN: MİKTAR GİRİŞ VE AKSİYON KUTUSU ─── */}
          <div className="bg-[#1c1c1e] border border-zinc-800/80 rounded-xl p-4 space-y-4 shadow-lg">
            
            {/* Mevcut Stok Bilgisi */}
            <div className="text-[14px] font-medium text-zinc-100 tracking-wide">
              Mevcut: <span className="text-zinc-300 font-normal">42 Adet</span>
            </div>

            {/* Miktar Giriş Satırı */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-[14px] font-medium text-zinc-100 tracking-wide whitespace-nowrap">
                Miktar Girin:
              </label>
              <input
                type="number"
                value={miktar}
                onChange={(e) => setMiktar(e.target.value)}
                className="w-full bg-[#121214] border border-emerald-800/60 rounded-lg py-2.5 px-4 text-left text-[16px] font-medium text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
              />
            </div>

            {/* Değişim Butonları (+1, +10, Sil) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button 
                onClick={() => setMiktar((prev) => (parseInt(prev) || 0) + 1 + '')}
                className="bg-[#2c2c2e] hover:bg-[#3a3a3c] active:bg-[#1c1c1e] text-zinc-200 py-3 rounded-lg text-[14px] font-medium transition-colors border border-zinc-700/30"
              >
                +1
              </button>
              <button 
                onClick={() => setMiktar((prev) => (parseInt(prev) || 0) + 10 + '')}
                className="bg-[#2c2c2e] hover:bg-[#3a3a3c] active:bg-[#1c1c1e] text-zinc-200 py-3 rounded-lg text-[14px] font-medium transition-colors border border-zinc-700/30"
              >
                +10
              </button>
              <button 
                onClick={() => setMiktar('')}
                className="bg-[#2c2c2e] hover:bg-[#3a3a3c] active:bg-[#1c1c1e] text-zinc-200 py-3 rounded-lg text-[14px] font-medium transition-colors border border-zinc-700/30"
              >
                Sil
              </button>
            </div>

            {/* Canlı Yeşil Onayla Butonu */}
            <button className="w-full bg-[#2ca86b] hover:bg-[#25935c] active:bg-[#1c7247] text-white font-medium py-3.5 rounded-xl transition-all tracking-widest text-[13px] uppercase mt-2 shadow-md shadow-emerald-950/20">
              ONAYLA
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
