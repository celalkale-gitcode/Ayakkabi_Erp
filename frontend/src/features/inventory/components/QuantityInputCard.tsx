'use client';

import React from 'react';

interface QuantityInputProps {
  mevcutStok: number;
  miktar: string;
  setMiktar: React.Dispatch<React.SetStateAction<string>>;
  onOnayla: () => void;
}

export default function QuantityInputCard({ 
  mevcutStok, 
  miktar, 
  setMiktar, 
  onOnayla 
}: QuantityInputProps) {

  const handleModify = (value: number) => {
    setMiktar((prev) => {
      const current = parseInt(prev) || 0;
      const next = current + value;
      // El terminalinde negatif miktar girişi veya eksiltmesi engellenir
      return next >= 0 ? next.toString() : '0';
    });
  };

  const handleConfirm = () => {
    const numericQuantity = parseInt(miktar) || 0;
    if (numericQuantity <= 0) {
      alert('Lütfen geçerli bir miktar girin (En az 1).');
      return;
    }
    onOnayla();
  };

  return (
    <div className="bg-[#1c1c1e] border border-zinc-800/80 rounded-2xl p-4 space-y-4 shadow-xl max-w-sm mx-auto">
      {/* Mevcut Stok Göstergesi */}
      <div className="text-[12px] font-bold text-zinc-500 tracking-widest uppercase">
        BU RAFTAKİ MEVCUT STOK: <span className="text-emerald-400 font-mono font-bold text-[14px] ml-1">{mevcutStok} ÇİFT</span>
      </div>

      {/* Miktar Giriş Alanı */}
      <div className="flex items-center justify-between gap-3 bg-[#121214] border border-zinc-850 rounded-xl p-1.5 focus-within:border-emerald-500/50 transition">
        <label className="text-[13px] font-medium text-zinc-400 tracking-wide whitespace-nowrap pl-2">
          Adet:
        </label>
        <input
          type="number"
          min="1"
          pattern="\d*"
          value={miktar}
          onChange={(e) => setMiktar(e.target.value)}
          className="w-full bg-transparent border-none text-right pr-2 text-[18px] font-bold text-white focus:outline-none font-mono"
          placeholder="1"
        />
      </div>

      {/* Hızlı Buton Takımı (El terminali için optimize adımlar) */}
      <div className="grid grid-cols-4 gap-2 pt-0.5">
        <button 
          onClick={() => handleModify(-1)} 
          className="bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-750 text-rose-400 py-3 rounded-xl text-[14px] font-bold border border-zinc-800/60 transition"
        >
          -1
        </button>
        <button 
          onClick={() => handleModify(1)} 
          className="bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-750 text-emerald-400 py-3 rounded-xl text-[14px] font-bold border border-zinc-800/60 transition"
        >
          +1
        </button>
        <button 
          onClick={() => handleModify(10)} 
          className="bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-750 text-blue-400 py-3 rounded-xl text-[14px] font-bold border border-zinc-800/60 transition"
        >
          +10
        </button>
        <button 
          onClick={() => setMiktar('')} 
          className="bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-750 text-zinc-500 py-3 rounded-xl text-[13px] font-medium border border-zinc-800/60 transition"
        >
          Temizle
        </button>
      </div>

      {/* Büyük Onay Butonu */}
      <button 
        onClick={handleConfirm} 
        className="w-full bg-[#2ca86b] hover:bg-[#25935c] active:bg-[#1e784a] text-white font-bold py-3.5 rounded-xl tracking-widest text-[13px] uppercase mt-1 shadow-lg shadow-emerald-950/20 transition duration-150"
      >
        KAYDET VE İLERLE
      </button>
    </div>
  );
}
