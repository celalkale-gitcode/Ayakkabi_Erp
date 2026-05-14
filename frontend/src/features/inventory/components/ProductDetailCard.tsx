import React from 'react';

interface ProductDetailProps {
  urunAdi: string;
  lokasyon: string;
  raf: string;
}

export default function ProductDetailCard({ urunAdi, lokasyon, raf }: ProductDetailProps) {
  return (
    <div className="bg-[#1c1c1e] border border-zinc-800/80 rounded-xl p-4 space-y-2 shadow-lg">
      <div className="text-[14px] font-medium tracking-wide text-zinc-100">
        ÜRÜN ADI: <span className="text-zinc-300 font-normal">{urunAdi}</span>
      </div>
      <div className="text-[14px] font-medium tracking-wide text-zinc-100">
        Lokasyon: <span className="text-zinc-300 font-normal">{lokasyon}</span>
      </div>
      <div className="text-[14px] font-medium tracking-wide text-zinc-100">
        Raf: <span className="text-zinc-300 font-normal">{raf}</span>
      </div>
    </div>
  );
}

