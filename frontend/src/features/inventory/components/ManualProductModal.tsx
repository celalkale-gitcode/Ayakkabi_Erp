'use client';

import { useState } from 'react';

interface Props {
  barkod: string;

  onSubmit: (data: any) => void;

  onClose: () => void;
}

export default function ManualProductModal({
  barkod,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">

        <h2 className="text-xl font-bold">
          Yeni Ürün Oluştur
        </h2>

        <input
          placeholder="Ürün Adı"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              urunAdi: e.target.value,
            })
          }
        />

        <input
          placeholder="Marka"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              marka: e.target.value,
            })
          }
        />

        <input
          placeholder="Renk"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              renk: e.target.value,
            })
          }
        />

        <input
          placeholder="Beden"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              beden: e.target.value,
            })
          }
        />

        <input
          placeholder="SKU"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              sku: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Miktar"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              miktar: Number(
                e.target.value,
              ),
            })
          }
        />

        <div className="flex gap-3">

          <button
            onClick={() =>
              onSubmit({
                barkod,
                ...form,
              })
            }
            className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
          >
            Kaydet
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 py-2 rounded-xl"
          >
            İptal
          </button>

        </div>
      </div>
    </div>
  );
}
