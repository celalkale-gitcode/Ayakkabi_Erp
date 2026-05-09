'use client';

import {
  useState,
  useCallback,
} from 'react';

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

  // Barkod okutma
  const handleScan = useCallback(
    async (barcode: string) => {

      if (loading) return;

      setLoading(true);

      try {

        const result =
          await inventoryApi
            .scanBarcode(barcode);

        // Barkod sistemde yok
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

        // Başarılı stok işlemi
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

            navigator.vibrate(100);
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

  // Manuel ürün oluştur
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

          // State temizle
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

    <div className="max-w-md mx-auto p-4 space-y-6">

      <h1 className="text-xl font-bold text-center">
        Mobil Stok Sayımı
      </h1>

      {/* Barkod Kamera - Değişiklik Burası: onScan -> onResult */}
      <BarcodeScanner
        onResult={handleScan}
      />

      {/* Loading */}
      {loading && (

        <div className="text-center text-blue-600 animate-pulse font-medium">
          İşleniyor...
        </div>
      )}

      {/* Son işlemler */}
      <ScanHistoryList
        items={scannedItems}
      />

      {/* Bilinmeyen barkod */}
      {showUnknownActions &&
        missingBarcode && (

        <div className="bg-white rounded-2xl shadow-lg border p-4 space-y-3">

          <div className="text-center">

            <h2 className="font-bold text-lg">
              Barkod Bulunamadı
            </h2>

            <p className="text-sm text-gray-500 mt-1 break-all">
              {missingBarcode}
            </p>
          </div>

          {/* Yeni ürün */}
          <button
            onClick={() => {

              setOpenManualModal(
                true,
              );
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-medium"
          >
            Yeni Ürün Ekle
          </button>

          {/* Tekrar tara */}
          <button
            onClick={() => {

              setMissingBarcode(
                null,
              );

              setShowUnknownActions(
                false,
              );
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 transition py-3 rounded-xl font-medium"
          >
            Tekrar Tara
          </button>

          {/* Manuel hızlı giriş */}
          <button
            onClick={() => {

              setOpenManualModal(
                true,
              );
            }}
            className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-xl font-medium"
          >
            Manuel Ekle
          </button>

        </div>
      )}

      {/* Manuel ürün modal */}
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
    </div>
  );
}
