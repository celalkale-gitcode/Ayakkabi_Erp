'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { productsApi }
  from '@/features/products/services/productsApi';

import {
  Product,
} from '@/features/products/types/product.types';

type SearchMode =
  | 'modelAdi'
  | 'sku'
  | 'barkod';

export default function ProductsPage() {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [searchMode, setSearchMode] =
    useState<SearchMode>('modelAdi');

  const [query, setQuery] =
    useState('');

  useEffect(() => {

    productsApi
      .getAll()
      .then((data) =>
        setProducts(data || []),
      );

  }, []);

  // FILTER ENGINE
  const filteredProducts =
    useMemo(() => {

      if (!query.trim()) return products;

      const q =
        query.toLowerCase();

      return products.filter(
        (p) => {

          if (
            searchMode ===
            'modelAdi'
          ) {
            return p.modelAdi
              ?.toLowerCase()
              .includes(q);
          }

          if (
            searchMode === 'sku'
          ) {
            return p.varyantlar?.some(
              (v) =>
                v.sku
                  ?.toLowerCase()
                  .includes(q),
            );
          }

          if (
            searchMode ===
            'barkod'
          ) {
            return p.varyantlar?.some(
              (v) =>
                v.barkodlar?.some(
                  (b) =>
                    b.barkod
                      ?.toLowerCase()
                      .includes(q),
                ),
            );
          }

          return false;
        },
      );
    }, [products, query, searchMode]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* STICKY TOP BAR */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm p-4 space-y-3">

        {/* SEARCH MODE */}
        <select
          value={searchMode}
          onChange={(e) =>
            setSearchMode(
              e.target
                .value as SearchMode,
            )
          }
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >

          <option value="modelAdi">
            Ürün adına göre ara
          </option>

          <option value="sku">
            SKU'ya göre ara
          </option>

          <option value="barkod">
            Barkoda göre ara
          </option>

        </select>

        {/* SEARCH INPUT */}
        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Arama yap..."
          className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
        />

      </div>

      {/* CONTENT */}
      <div className="p-6">

        <h1 className="text-2xl font-bold mb-6">
          Ürün Listesi
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filteredProducts.map((p) => (

            <div
              key={p.id}
              className="
                bg-white p-4 rounded-xl shadow border
                hover:shadow-lg hover:-translate-y-1
                transition-all duration-200
              "
            >

              {/* HEADER */}
              <h2 className="font-bold text-lg">
                {p.modelAdi}
              </h2>

              <p className="text-sm text-gray-500">
                Kod: {p.modelKodu}
              </p>

              <p className="text-sm text-gray-500 mb-3">
                Marka: {p.marka || '-'}
              </p>

              {/* VARIANTS */}
              <div className="space-y-2">

                {p.varyantlar?.map((v) => (

                  <div
                    key={v.id}
                    className="
                      border rounded-lg p-3 bg-slate-50
                      hover:bg-slate-100 transition
                    "
                  >

                    {/* RENK / BEDEN */}
                    <div className="flex justify-between items-center">

                      <div className="flex items-center justify-between">

  {/* SOL TARAF: RENK / BEDEN / STOK */}
  <span className="font-medium text-gray-800">
    {v.renk} / {v.beden} / (Stok: {v.stokMiktari})
  </span>

  {/* SAĞ TARAF: RENKLİ BADGE */}
  <span
    className={`
      text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap
      ${v.stokMiktari > 5
        ? 'bg-green-100 text-green-700'
        : v.stokMiktari > 0
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700'}
    `}
  >
    {v.stokMiktari}
  </span>

</div>

                    </div>

                    {/* SKU */}
                    <p className="text-xs text-gray-500 mt-1">
                      SKU: {v.sku}
                    </p>

                    {/* BARKODLAR */}
                    <div className="flex flex-wrap gap-1 mt-2">

                      {v.barkodlar?.map((b) => (

                        <span
                          key={b.id}
                          className="
                            text-[10px] bg-blue-100 text-blue-700
                            px-2 py-1 rounded-full
                          "
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

        {/* EMPTY STATE */}
        {filteredProducts.length === 0 && (

          <div className="text-center text-gray-400 mt-10">
            Ürün bulunamadı
          </div>
        )}

      </div>
    </div>
  );
}
