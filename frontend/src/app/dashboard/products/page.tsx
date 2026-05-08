'use client';

import {
  useEffect,
  useState,
} from 'react';

import { productsApi }
  from '@/features/products/services/productsApi';

import {
  Product,
} from '@/features/products/types/product.types';

export default function ProductsPage() {

  const [products, setProducts] =
    useState<Product[]>([]);

  useEffect(() => {

    productsApi
      .getAll()
      .then((data) =>
        setProducts(data || []),
      );

  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">

      <h1 className="text-2xl font-bold mb-6">
        Ürün Listesi
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {products.map((p) => (

          <div
            key={p.id}
            className="bg-white p-4 rounded-xl shadow border"
          >

            {/* Ürün başlık */}
            <h2 className="font-bold text-lg">
              {p.modelAdi}
            </h2>

            <p className="text-sm text-gray-500">
              Kod: {p.modelKodu}
            </p>

            <p className="text-sm text-gray-500 mb-3">
              Marka: {p.marka || '-'}
            </p>

            {/* Varyantlar */}
            <div className="space-y-2">

              {p.varyantlar?.map((v) => (

                <div
                  key={v.id}
                  className="border rounded-lg p-3 bg-slate-50"
                >

                  {/* RENK + BEDEN (temiz ayrım) */}
                  <div className="flex justify-between items-center">

                    <span className="font-medium text-gray-800">
                      {v.renk} / {v.beden}
                    </span>

                    {/* STOK badge */}
                    <span
                      className={`
                        px-2 py-1 rounded-full text-xs font-bold
                        ${v.stokMiktari > 5
                          ? 'bg-green-100 text-green-700'
                          : v.stokMiktari > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'}
                      `}
                    >
                      Stok: {v.stokMiktari}
                    </span>

                  </div>

                  {/* SKU */}
                  <p className="text-xs text-gray-500 mt-1">
                    SKU: {v.sku}
                  </p>

                  {/* Barkodlar */}
                  <div className="flex flex-wrap gap-1 mt-2">

                    {v.barkodlar?.map((b) => (

                      <span
                        key={b.id}
                        className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {b.barkod}
                      </span>
                    ))}

                  </div>

                </div>
              ))}

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
