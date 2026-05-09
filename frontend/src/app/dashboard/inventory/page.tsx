'use client';

import {
  useState,
  useCallback,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  PackageSearch,
  ScanLine,
  Plus,
  RotateCcw,
  Loader2,
} from 'lucide-react';

import BarcodeScanner
  from '@/features/inventory/components/BarcodeScanner';

import ManualProductModal
  from '@/features/inventory/components/ManualProductModal';

import ScanHistoryList
  from '@/features/inventory/components/ScanHistoryList';

import { inventoryApi }
  from '@/features/inventory/services/inventoryApi';

import { useInventoryStore }
  from '@/features/inventory/store/useInventoryStore';

export default function InventoryPage() {

  const [loading, setLoading] =
    useState(false);

  const [
    missingBarcode,
    setMissingBarcode,
  ] = useState<string | null>(
    null,
  );

  const [
    showUnknownActions,
    setShowUnknownActions,
  ] = useState(false);

  const [
    openManualModal,
    setOpenManualModal,
  ] = useState(false);

  const {
    scannedItems,
    addScannedItem,
  } = useInventoryStore();

  // BARKOD OKUT
  const handleScan = useCallback(

    async (barcode: string) => {

      if (loading) return;

      setLoading(true);

      try {

        const result =
          await inventoryApi
            .scanBarcode(barcode);

        // BARKOD BULUNAMADI
        if (
          result?.code ===
          'PRODUCT_NOT_FOUND'
        ) {

          setMissingBarcode(
            result.barkod,
          );

          setShowUnknownActions(
            true,
          );

          return;
        }

        // STOK GÜNCELLENDİ
        if (result?.success) {

          addScannedItem({

            sku:
              result.sku,

            yeniStok:
              result.yeniStok,

            islemTarihi:
              result.islemTarihi,
          });

          if (
            typeof navigator !==
              'undefined' &&
            navigator.vibrate
          ) {

            navigator.vibrate(120);
          }
        }

      } catch (err: any) {

        console.error(
          'Barkod hatası:',
          err?.message,
        );

      } finally {

        setTimeout(() => {

          setLoading(false);

        }, 1200);
      }
    },

    [
      loading,
      addScannedItem,
    ],
  );

  // MANUEL ÜRÜN EKLE
  const handleManualCreate =
    async (data: any) => {

      try {

        const result =
          await inventoryApi
            .createManualProduct(
              data,
            );

        if (result?.success) {

          addScannedItem({

            sku:
              result.sku,

            yeniStok:
              result.stok,

            islemTarihi:
              result.islemTarihi,
          });

          // RESET
          setMissingBarcode(
            null,
          );

          setOpenManualModal(
            false,
          );

          setShowUnknownActions(
            false,
          );

          if (
            typeof navigator !==
              'undefined' &&
            navigator.vibrate
          ) {

            navigator.vibrate(200);
          }
        }

      } catch (err) {

        console.error(err);
      }
    };

  return (

    <div className="
      min-h-screen
      bg-gradient-to-b
      from-slate-50
      to-slate-100
      p-4
    ">

      <div className="
        max-w-md
        mx-auto
        space-y-6
      ">

        {/* HEADER */}
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            bg-white
            rounded-3xl
            p-5
            shadow-sm
            border
            border-slate-200
          "
        >

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-12
              h-12
              rounded-2xl
              bg-blue-600
              text-white
              flex
              items-center
              justify-center
              shadow-lg
            ">

              <ScanLine size={24} />

            </div>

            <div>

              <h1 className="
                text-2xl
                font-extrabold
                text-slate-800
              ">

                Mobil Stok Sayımı

              </h1>

              <p className="
                text-sm
                text-slate-500
              ">

                Barkod okut ve stoğu güncelle

              </p>

            </div>

          </div>

        </motion.div>

        {/* BARKOD SCANNER */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >

          <BarcodeScanner
            onResult={handleScan}
          />

        </motion.div>

        {/* LOADING */}
        <AnimatePresence>

          {loading && (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                bg-white
                rounded-2xl
                p-4
                shadow-sm
                border
                border-blue-100
              "
            >

              <div className="
                flex
                items-center
                justify-center
                gap-3
                text-blue-600
                font-semibold
              ">

                <Loader2
                  size={20}
                  className="animate-spin"
                />

                İşleniyor...

              </div>

            </motion.div>
          )}

        </AnimatePresence>

        {/* BİLİNMEYEN BARKOD */}
        <AnimatePresence>

          {showUnknownActions &&
            missingBarcode && (

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 20,
              }}
              className="
                bg-white
                rounded-3xl
                shadow-xl
                border
                border-slate-200
                p-5
                space-y-4
              "
            >

              <div className="text-center">

                <div className="
                  mx-auto
                  w-14
                  h-14
                  rounded-2xl
                  bg-red-100
                  text-red-600
                  flex
                  items-center
                  justify-center
                  mb-3
                ">

                  <PackageSearch
                    size={28}
                  />

                </div>

                <h2 className="
                  font-bold
                  text-xl
                  text-slate-800
                ">

                  Barkod Bulunamadı

                </h2>

                <p className="
                  text-sm
                  text-slate-500
                  mt-2
                  break-all
                ">

                  {missingBarcode}

                </p>

              </div>

              {/* YENİ ÜRÜN */}
              <button
                onClick={() => {

                  setOpenManualModal(
                    true,
                  );
                }}
                className="
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  py-3.5
                  rounded-2xl
                  font-semibold
                  transition-all
                  shadow-lg
                  shadow-blue-100
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                <Plus size={18} />

                Yeni Ürün Ekle

              </button>

              {/* TEKRAR TARA */}
              <button
                onClick={() => {

                  setMissingBarcode(
                    null,
                  );

                  setShowUnknownActions(
                    false,
                  );
                }}
                className="
                  w-full
                  bg-slate-100
                  hover:bg-slate-200
                  text-slate-700
                  py-3.5
                  rounded-2xl
                  font-semibold
                  transition-all
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                <RotateCcw
                  size={18}
                />

                Tekrar Tara

              </button>

              {/* MANUEL EKLE */}
              <button
                onClick={() => {

                  setOpenManualModal(
                    true,
                  );
                }}
                className="
                  w-full
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  py-3.5
                  rounded-2xl
                  font-semibold
                  transition-all
                  shadow-lg
                  shadow-green-100
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                <Plus size={18} />

                Manuel Ekle

              </button>

            </motion.div>
          )}

        </AnimatePresence>

        {/* GEÇMİŞ */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
        >

          <ScanHistoryList
            items={scannedItems}
          />

        </motion.div>

        {/* MODAL */}
        <AnimatePresence>

          {openManualModal &&
            missingBarcode && (

            <ManualProductModal

              barkod={
                missingBarcode
              }

              onSubmit={
                handleManualCreate
              }

              onClose={() => {

                setOpenManualModal(
                  false,
                );

                setMissingBarcode(
                  null,
                );

                setShowUnknownActions(
                  false,
                );
              }}
            />
          )}

        </AnimatePresence>

      </div>

    </div>
  );
}
