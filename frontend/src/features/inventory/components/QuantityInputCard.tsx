'Miktar Giriş Kartı Bileşeni';

import React from 'react';

interface QuantityInputProps {
  mevcutStok: number;
  miktar: string;
  setMiktar: React.Dispatch<React.SetStateAction<string>>;
  onOnayla: () => void;
}

export default function QuantityInputCard({ mevcutStok, miktar, setMiktar, onOnayla }: QuantityInputProps) {
  const handleModify = (value: number) => {
    setMiktar((prev) => (parseInt(prev) || 0) + value + '');
  };

  return (
    <div className="bg-[#1c1c1e] border border-zinc-800/80 rounded-xl p-4 space-y-4 shadow-lg">
      <div className="text-[14px] font-medium text-zinc-100 tracking-wide">
        Mevcut: <span className="text-zinc-300 font-normal">{mevcutStok} Adet</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="text-[14px] font-medium text-zinc-100 tracking-wide whitespace-nowrap">
          Miktar Girin:
        </label>
        <input
          type="number"
          value={miktar}
          onChange={(e) => setMiktar(e.target.value)}
          className="w-full bg-[#121214] border border-emerald-800/60 rounded-lg py-2.5 px-4 text-left text-[16px] font-medium text-white focus:outline-none focus:border-emerald-500 font-mono"
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <button onClick={() => handleModify(1)} className="bg-[#2c2c2e] hover:bg-[#3a3a3c] text-zinc-200 py-3 rounded-lg text-[14px] font-medium border border-zinc-700/30">
          +1
        </button>
        <button onClick={() => handleModify(10)} className="bg-[#2c2c2e] hover:bg-[#3a3a3c] text-zinc-200 py-3 rounded-lg text-[14px] font-medium border border-zinc-700/30">
          +10
        </button>
        <button onClick={() => setMiktar('')} className="bg-[#2c2c2e] hover:bg-[#3a3a3c] text-zinc-200 py-3 rounded-lg text-[14px] font-medium border border-zinc-700/30">
          Sil
        </button>
      </div>

      <button onClick={onOnayla} className="w-full bg-[#2ca86b] hover:bg-[#25935c] text-white font-medium py-3.5 rounded-xl tracking-widest text-[13px] uppercase mt-2 shadow-md">
        ONAYLA
      </button>
    </div>
  );
}

