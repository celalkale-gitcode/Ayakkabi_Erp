'use client';

import { useState } from 'react';

import BarkodScanner from '@/features/inventory/components/BarcodeScanner';

export default function InventoryPage() {
  const [barcode, setBarcode] = useState('');

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Envanter
        </h1>

        <p className="text-slate-500 mt-1">
          Barkod ile ürün tarama sistemi
        </p>
      </div>

      {/* SCANNER */}
      <BarkodScanner
        onResult={(code: string) => {
          setBarcode(code);
        }}
      />

      {/* RESULT */}
      {barcode && (
        <div
          className="
            p-5
            rounded-2xl
            border
            bg-white
            shadow-sm
          "
        >
          <p className="text-sm text-slate-500">
            Son Okunan Barkod
          </p>

          <p
            className="
              mt-2
              text-2xl
              font-black
              text-blue-600
              tracking-wider
            "
          >
            {barcode}
          </p>
        </div>
      )}
    </div>
  );
}
