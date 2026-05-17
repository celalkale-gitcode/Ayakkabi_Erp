'use client';

import { useEffect, useMemo, useState } from 'react';
import { productsApi } from '@/features/products/services/productsApi';
import { Product } from '@/features/products/types/product.types';

type SearchMode = 'modelAdi' | 'sku' | 'barkod';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode>('modelAdi');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getAll()
      .then((data) => setProducts(data || []))
      .catch((err) => console.error('Ürünler yüklenirken hata:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();

    return products.filter((p) => {
      if (searchMode === 'modelAdi') {
        return p.modelAdi?.toLowerCase().includes(q) || p.modelKodu?.toLowerCase().includes(q);
      }
      if (searchMode === 'sku') {
        return p.varyantlar?.some((v) => v.sku?.toLowerCase().includes(q));
      }
      if (searchMode === 'barkod') {
        return p.varyantlar?.some((v) =>
          v.barkodlar?.some((b) => b.barkod?.toLowerCase().includes(q))
        );
      }
      return false;
    });
  }, [products, query, searchMode]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <div className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 p-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          <div className="w-full sm:w-64 shrink-0">
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as SearchMode)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 focus:outline-none focus:border-zinc-700 transition"
            >
              <option value="modelAdi">Ürün Adı / Kodu</option>
              <option value="sku">SKU Kodu</option>
              <option value="barkod">Barkod Numarası</option>
            </select>
          </div>
          <div className="w-full relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchMode === 'modelAdi' ? 'Model adı veya kodu yazın...' : searchMode === 'sku' ? 'SKU girin...' : 'Barkod okutun...'}
              className="w-full bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition font-mono placeholder-zinc-600"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs font-mono">
                TEMİZLE
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-xl font-bold tracking-wide text-zinc-100">Merkezi Ürün Envanteri</h1>
        <p className="text-xs text-zinc-500 mb-6">Toplam {filteredProducts.length} model listeleniyor</p>

        {isLoading ? (
          <div className="text-center py-20 text-sm font-mono text-zinc-500 animate-pulse">Envanter yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700/80 transition duration-200">
                <div className="border-b border-zinc-800 pb-3 mb-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{product.marka || 'Markasız'}</span>
                  <h2 className="font-bold text-[16px] text-zinc-100 mt-1.5">{product.modelAdi}</h2>
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">Kod: <span className="text-zinc-400">{product.modelKodu}</span></p>
                </div>

                <div className="space-y-3 flex-1">
                  {product.varyantlar?.map((variant) => (
                    <div key={variant.id} className="border border-zinc-800/80 rounded-xl p-3 bg-zinc-950/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-zinc-300">{variant.renk} / {variant.beden}</span>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${variant.stokMiktari > 10 ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/40 text-amber-400'}`}>{variant.stokMiktari} Çift</span>
                      </div>
                      
                      {variant.konumStoklari && variant.konumStoklari.length > 0 && (
                        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/40 space-y-1">
                          <div className="grid grid-cols-2 gap-1.5">
                            {variant.konumStoklari.map((ks) => (
                              <div key={ks.id} className="flex justify-between items-center bg-zinc-950 px-2 py-1 rounded border border-zinc-800/40 font-mono text-[10px]">
                                <span className="text-zinc-400">{ks.konumKodu}</span>
                                <span className="text-blue-400 font-bold">{ks.miktar} Çf</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
