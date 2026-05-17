'use client';

import { useState } from 'react';

interface Props {
  barkod: string;
  konumId: string; // YENİ: Stok kaydının yapılacağı zorunlu raf ID'si
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function ManualProductModal({
  barkod,
  konumId, // Proplardan aldık
  onSubmit,
  onClose,
}: Props) {
  const [form, setForm] = useState({
    urunAdi: '',
    marka: '',
    renk: '',
    beden: '',
    sku: '',
    miktar: 1,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Yeni Ürün Oluştur</h2>
          <p className="text-xs text-gray-500 mt-1">
            Barkod: <span className="font-mono font-semibold text-gray-700">{barkod}</span>
          </p>
        </div>

        <input
          placeholder="Ürün Adı"
          className="w-full border p-2 rounded"
          value={form.urunAdi}
          onChange={(e) => setForm({ ...form, urunAdi: e.target.value })}
        />

        <input
          placeholder="Marka"
          className="w-full border p-2 rounded"
          value={form.marka}
          onChange={(e) => setForm({ ...form, marka: e.target.value })}
        />

        <input
          placeholder="Renk"
          className="w-full border p-2 rounded"
          value={form.renk}
          onChange={(e) => setForm({ ...form, renk: e.target.value })}
        />

        <input
          placeholder="Beden"
          className="w-full border p-2 rounded"
          value={form.beden}
          onChange={(e) => setForm({ ...form, beden: e.target.value })}
        />

        <input
          placeholder="SKU"
          className="w-full border p-2 rounded"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
        />

        <input
          type="number"
          min="1"
          placeholder="Miktar"
          className="w-full border p-2 rounded"
          value={form.miktar}
          onChange={(e) => setForm({ ...form, miktar: Number(e.target.value) })}
        />

        <div className="flex gap-3 pt-2">
          <button
            onClick={() =>
              onSubmit({
                barkod,
                konumId, // GÜNCELLENDİ: Backend'e gidecek veri paketine zorunlu raf bilgisi eklendi
                ...form,
              })
            }
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition"
          >
            Kaydet
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold transition"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
