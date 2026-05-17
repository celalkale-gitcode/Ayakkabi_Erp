'use client';

import React from 'react';

interface ProductDetailProps {
  urunAdi: string;
  lokasyon: string;
  raf: string;
}

export default function ProductDetailCard({ urunAdi, lokasyon, raf }: ProductDetailProps) {
  return (
    <div className="bg-[#1c1c1e] border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-xl max-w-sm mx-auto">
      {/* Üst Bilgi Başlığı */}
      <div className="border-b border-zinc-800/60 pb-2">
        <span className="text-[10px] font-bold tracking-widest text-zinc-500 block mb-0.5">
          OKUTULAN ÜRÜN BİLGİSİ
        </span>
        <h3 className="text-[14px] font-semibold text-zinc-100 leading-snug break-words">
          {urunAdi || 'Yükleniyor...'}
        </h3>
      </div>

      {/* Lokasyon ve Raf Alanları (Kompakt Grid Yapısı) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Lokasyon Kutusu */}
        <div className="bg-zinc-900/60 border border-zinc-800/50 p-2.5 rounded-xl">
          <span className="text-[10px] font-semibold text-zinc-500 block tracking-wide mb-1">
            LOKASYON
          </span>
          <span className="text-[13px] font-medium text-zinc-300 block truncate">
            {lokasyon || 'Belirtilmedi'}
          </span>
        </div>

        {/* Raf Kutusu */}
        <div className="bg-zinc-900/60 border border-zinc-800/50 p-2.5 rounded-xl">
          <span className="text-[10px] font-semibold text-zinc-500 block tracking-wide mb-1">
            RAF / HÜCRE
          </span>
          <span className="text-[13px] font-bold text-blue-400 block truncate">
            {raf || 'Atanmadı'}
          </span>
        </div>
      </div>
    </div>
  );
}
