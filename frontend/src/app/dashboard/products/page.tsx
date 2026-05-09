'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  LucideScanBarcode,
  LucideX,
} from 'lucide-react';

import { productsApi }
  from '@/features/products/services/productsApi';

import {
  Product,
} from '@/features/products/types/product.types';

import {
  containerVariants,
  itemVariants,
} from '@/constants/animations';

import {
  ProductSkeleton,
} from '@/components/ProductSkeleton';

import BarcodeScanner
  from '@/features/inventory/components/BarcodeScanner';

type SearchMode =
  | 'modelAdi'
  | 'sku'
  | 'barkod';

export default function ProductsPage() {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchMode, setSearchMode] =
    useState<SearchMode>('modelAdi');

  const [query, setQuery] =
    useState('');

  const [showScanner, setShowScanner] =
    useState(false);

  useEffect(() => {

    productsApi
      .getAll()
      .then((data) => {

        setProducts(data || []);
        setLoading(false);
      });

  }, []);

  // FILTER
  const filteredProducts =
    useMemo(() => {

      if (!query.trim()) {
        return products;
      }

      const q =
        query.toLowerCase();

      return products.filter((p) => {

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

      });

    }, [
      products,
      query,
      searchMode,
    ]);

  // BARKOD SONUCU
  const handleBarcodeResult =
    (result: string) => {

      setSearchMode('barkod');

      setQuery(result);

      setShowScanner(false);
    };

  return (

    <div className="min-h-screen bg-[#f8fafc] text-slate-900">

      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 shadow-sm">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 items-center">

          {/* SEARCH MODE */}
          <select
            value={searchMode}
            onChange={(e) =>
              setSearchMode(
                e.target
                  .value as SearchMode,
              )
            }
            className="
              w-full md:w-1/4
              border border-slate-200
              rounded-xl
              px-3 py-2.5
              text-sm
              focus:ring-2
              focus:ring-blue-500
              outline-none
              bg-white
            "
          >

            <option value="modelAdi">
              Ürün Adı
            </option>

            <option value="sku">
              SKU Kodu
            </option>

            <option value="barkod">
              Barkod
            </option>

          </select>

          {/* SEARCH */}
          <div className="relative flex-1 w-full">

            <input
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value,
                )
              }
              placeholder="Arama yap..."
              className="
                w-full
                border border-slate-200
                rounded-xl
                px-4 py-2.5
                focus:ring-2
                focus:ring-blue-500
                outline-none
              "
            />

            {query && (

              <button
                onClick={() =>
                  setQuery('')
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  hover:text-slate-600
                "
              >

                <LucideX size={18} />

              </button>
            )}

          </div>

          {/* BARKOD BUTTON */}
          <button
            onClick={() =>
              setShowScanner(
                !showScanner,
              )
            }
            className={`
              flex items-center justify-center gap-2
              px-6 py-2.5
              rounded-xl
              font-semibold
              transition-all duration-300

              ${
                showScanner
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-900 text-white'
              }
            `}
          >

            {showScanner
              ? (
                <LucideX size={20} />
              )
              : (
                <LucideScanBarcode size={20} />
              )}

            <span className="hidden md:inline">

              {showScanner
                ? 'Kapat'
                : 'Barkod'}

            </span>

          </button>

        </div>

      </div>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto p-6">

        {/* SCANNER */}
        <AnimatePresence>

          {showScanner && (

            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="mb-8 overflow-hidden"
            >

              {/* DÜZELTİLDİ */}
              <BarcodeScanner
                onResult={
                  handleBarcodeResult
                }
                onClose={() =>
                  setShowScanner(
                    false,
                  )
                }
              />

            </motion.div>
          )}

        </AnimatePresence>

        {/* TITLE */}
        <header className="flex justify-between items-end mb-8">

          <div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">

              Ürün Kataloğu

            </h1>

            <p className="text-slate-500 mt-1">

              {loading
                ? 'Yükleniyor...'
                : `${filteredProducts.length} ürün bulundu`}

            </p>

          </div>

        </header>

        {/* LOADING */}
        {loading ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {[...Array(6)].map(
              (_, i) => (

                <ProductSkeleton
                  key={i}
                />
              ),
            )}

          </div>

        ) : (

          <motion.div
            variants={
              containerVariants
            }
            initial="hidden"
            animate="visible"
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              gap-6
            "
          >

            <AnimatePresence mode="popLayout">

              {filteredProducts.map(
                (p) => (

                  <motion.div
                    key={p.id}
                    variants={
                      itemVariants
                    }
                    layout
                    className="
                      bg-white
                      p-5
                      rounded-2xl
                      border
                      border-slate-200
                      shadow-sm
                      hover:shadow-xl
                      transition-all
                    "
                  >

                    {/* PRODUCT */}
                    <div className="mb-4">

                      <h2 className="font-bold text-xl">

                        {p.modelAdi}

                      </h2>

                      <div className="flex gap-2 mt-2">

                        <span className="
                          text-[11px]
                          font-bold
                          bg-slate-100
                          text-slate-600
                          px-2 py-1
                          rounded-lg
                        ">

                          {p.modelKodu}

                        </span>

                        {p.marka && (

                          <span className="
                            text-[11px]
                            font-bold
                            bg-blue-50
                            text-blue-600
                            px-2 py-1
                            rounded-lg
                          ">

                            {p.marka}

                          </span>
                        )}

                      </div>

                    </div>

                    {/* VARIANTS */}
                    <div className="space-y-3">

                      {p.varyantlar?.map(
                        (v) => (

                          <div
                            key={v.id}
                            className="
                              border
                              rounded-xl
                              p-3
                              bg-slate-50
                            "
                          >

                            <div className="
                              flex
                              justify-between
                              items-center
                              text-sm
                            ">

                              {/* DÜZELTİLEN FORMAT */}
                              <span className="
                                font-semibold
                                text-slate-700
                              ">

                                {v.renk}
                                {' / '}
                                {v.beden}
                                {' / '}
                                Stok:
                                {' '}
                                {v.stokMiktari}

                              </span>

                            </div>

                            {/* BARKOD */}
                            <div className="
                              flex flex-wrap
                              gap-1
                              mt-2
                            ">

                              {v.barkodlar?.map(
                                (b) => (

                                  <span
                                    key={b.id}
                                    className="
                                      text-[10px]
                                      font-mono
                                      bg-white
                                      border
                                      border-slate-200
                                      px-2 py-0.5
                                      rounded
                                      text-slate-500
                                    "
                                  >

                                    {b.barkod}

                                  </span>
                                ),
                              )}

                            </div>

                          </div>
                        ),
                      )}

                    </div>

                  </motion.div>
                ),
              )}

            </AnimatePresence>

          </motion.div>
        )}

        {/* EMPTY */}
        {!loading &&
          filteredProducts.length === 0 && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="
              text-center
              py-24
              bg-white
              rounded-3xl
              border-2
              border-dashed
              border-slate-200
            "
          >

            <p className="
              text-slate-400
              text-lg
            ">

              Eşleşen ürün bulunamadı.

            </p>

          </motion.div>
        )}

      </main>

    </div>
  );
}
