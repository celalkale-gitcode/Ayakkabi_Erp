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

  const [missingBarcode,
    setMissingBarcode] =
      useState<string | null>(null);

  const {
    scannedItems,
    addScannedItem,
  } = useInventoryStore();

  const handleScan = useCallback(
    async (barcode: string) => {

      if (loading) return;

      setLoading(true);

      try {

        const result =
          await inventoryApi
            .scanBarcode(barcode);

        // Ürün bulunamadı
        if (
          result?.code ===
          'PRODUCT_NOT_FOUND'
        ) {

          setMissingBarcode(
            result.barkod,
          );

          return;
        }

        // Başarılı stok artışı
        addScannedItem(result);

        if (
          typeof navigator !==
            'undefined' &&
          navigator.vibrate
        ) {
          navigator.vibrate(100);
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

  const handleManualCreate =
    async (data: any) => {

      try {

        const result =
          await inventoryApi
            .createManualProduct(data);

        addScannedItem({
          sku: result.sku,
          yeniStok: result.stok,
        });

        setMissingBarcode(null);

      } catch (err) {

        console.error(err);
      }
    };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">

      <h1 className="text-xl font-bold text-center">
        Mobil Stok Sayımı
      </h1>

      <BarcodeScanner
        onScan={handleScan}
      />

      {loading && (
        <div className="text-center text-blue-600 animate-pulse font-medium">
          İşleniyor...
        </div>
      )}

      <ScanHistoryList
        items={scannedItems}
      />

      {missingBarcode && (

        <ManualProductModal
          barkod={missingBarcode}

          onSubmit={
            handleManualCreate
          }

          onClose={() =>
            setMissingBarcode(
              null,
            )
          }
        />
      )}
    </div>
  );
}      
