'use client';

import React from 'react';
import { ScannedItem } from '../types/inventory.types';

interface Props {
  items: ScannedItem[];
}

export default function ScanHistoryList({ items }: Props) {
  return (
    <div className="bg-[#1c1c1e] border border-zinc-800/80 rounded-2xl shadow-xl p-4 max-w-sm mx-auto">
      {/* Başlık alanı */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
        <h2 className="font-bold text-[12px] tracking-widest text-zinc-400 uppercase">
          SON İŞLEMLER (GEÇMİŞ)
        </h2>
        <span className="text-[10px] bg-zinc-900 text-zinc-500 font-mono px-2 py-0.5 rounded-md border border-zinc-800">
          {items.length} kayıt
        </span>
      </div>

      {/* Kaydırılabilir liste alanı */}
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
        {items.map((item, idx) => (
          <div
            key={(item.sku || item.barkod) + idx}
            className="flex justify-between items-center p-2.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/60 rounded-xl transition"
          >
            {/* Sol Blok: Ürün SKU ve İşlem Zamanı */}
            <div className="space-y-0.5">
              <p className="font-mono font-bold text-[13px] text-zinc-200 tracking-wide">
                {item.sku || 'Bilinmeyen Ürün'}
              </p>
              
              <div className="flex items-center gap-2">
                {/* YENİ: Personelin hangi rafa işlem yaptığını listede gösteriyoruz */}
                {item.konumKodu && (
                  <span className="text-[10px] font-mono bg-blue-950/40 text-blue-400 font-semibold px-1.5 py-0.5 rounded border border-blue-900/30">
                    {item.konumKodu}
                  </span>
                )}
                <span className="text-[10px] text-zinc-500 font-mono">
                  {item.islemTarihi
                    ? new Date(item.islemTarihi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </span>
              </div>
            </div>

            {/* Sağ Blok: Eklenen / Güncellenen Miktar Etiketi */}
            <div className="text-right">
              <span className="bg-emerald-950/50 border border-emerald-900/40 text-emerald-400 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold block">
                +{item.miktar || item.yeniStok} Çift
              </span>
            </div>
          </div>
        ))}

        {/* Boş Durum (Empty State) */}
        {items.length === 0 && (
          <div className="text-center text-zinc-500 italic text-[12px] py-6 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-xl">
            Henüz barkod okutulmadı.
          </div>
        )}
      </div>
    </div>
  );
}
