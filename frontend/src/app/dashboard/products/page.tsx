'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi } from '@/features/products/services/productsApi';
import { Product } from '@/features/products/types/product.types';
import { containerVariants, itemVariants } from '@/constants/animations';
import { ProductSkeleton } from '@/components/ProductSkeleton';

type SearchMode = 'modelAdi' | 'sku' | 'barkod';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState<SearchMode>('modelAdi');
  const [query, setQuery] = useState('');

  useEffect(() => {
    productsApi.getAll().then((data) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter((p) => {
      if (searchMode === 'modelAdi') return p.modelAdi?.toLowerCase().includes(q);
      if (searchMode === 'sku') return p.varyantlar?.some((v) => v.sku?.toLowerCase().includes(q));
      if (searchMode === 'barkod') return p.varyantlar?.some((v) => v.barkodlar?.some((b) => b.barkod?.toLowerCase().includes(q)));
      return false;
    });
  }, [products, query, searchMode]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* MODERN STICKY HEADER */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3">
          <select
            value={searchMode}
            onChange={(e) => setSearchMode(e.target.value as SearchMode)}
            className="md:w-1/4 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="modelAdi">Ürün Adı</option>
            <option value="sku">SKU Kodu</option>
            <option value="barkod">Barkod</option>
          </select>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${searchMode === 'modelAdi' ? 'Ürün adı' : searchMode.toUpperCase()} ile ara...`}
            className="flex-1 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Ürün Katalogu</h1>
            <p className="text-slate-500 mt-1">{filteredProducts.length} ürün listelendi</p>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p) => (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  layout
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
                >
                  <div className="mb-4">
                    <h2 className="font-bold text-xl group-hover:text-blue-600 transition-colors">{p.modelAdi}</h2>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {p.modelKodu}
                      </span>
                      <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                        {p.marka || 'Markasız'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {p.varyantlar?.map((v) => (
                      <div key={v.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-700">{v.renk} / {v.beden}</span>
                          <span className={`font-bold ${v.stokMiktari > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {v.stokMiktari} Adet
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {v.barkodlar?.map((b) => (
                            <span key={b.id} className="text-[10px] font-mono bg-white border px-1.5 py-0.5 rounded shadow-sm text-slate-500">
                              {b.barkod}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-slate-400 text-lg">Eşleşen ürün bulunamadı.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
