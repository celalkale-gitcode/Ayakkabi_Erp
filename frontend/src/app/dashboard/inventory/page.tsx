'use client';

import { useState } from 'react';

// COMPONENTS
import BarkodScanner from '@/features/inventory/components/BarcodeScanner';
import ScanHistoryList from '@/features/inventory/components/ScanHistoryList';
import ManualProductModal from '@/features/inventory/components/ManualProductModal';
import CameraButton from '@/features/inventory/components/CameraButton';
import TabMenu, {
  TabType,
} from '@/features/inventory/components/TabMenu';

// STORE & API
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';

import type {
  ManualProductPayload,
} from '@/features/inventory/types/inventory.types';

export default function InventoryPage() {

  const [barcode, setBarcode] = useState('');

  const [activeTab, setActiveTab] =
    useState<TabType>('scan');

  const [showManualModal, setShowManualModal] =
    useState(false);

  const [showSelectionModal, setShowSelectionModal] =
    useState(false);

  const [lastScanned, setLastScanned] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [scannerOpen, setScannerOpen] =
    useState(false);

  const [quantityInput, setQuantityInput] =
    useState<number>(45);

  const [currentProduct, setCurrentProduct] =
    useState({
      name: 'LED PANEL - 24W (PHILIPS)',
      location: 'A-12-04',
      shelf: '03',
      currentStock: 42,
      sku: 'STK-45678',
    });

  const {
    scannedItems,
    addScannedItem,
  } = useInventoryStore();

  // BARKOD OKUNDU
  const handleBarcode = async (
    code: string
  ) => {

    setBarcode(code);

    if (
      lastScanned === code ||
      isLoading
    ) {
      return;
    }

    setLastScanned(code);

    setTimeout(() => {
      setLastScanned(null);
    }, 2000);

    try {

      setIsLoading(true);

      const data =
        await inventoryApi.scanBarcode(
          code
        );

      if (
        data &&
        data.success !== false
      ) {

        let resolvedSku =
          data.sku || code;

        let resolvedStock =
          typeof data.yeniStok ===
          'number'
            ? data.yeniStok
            : 42;

        let productName =
          data.modelAdi ||
          'LED PANEL - 24W (PHILIPS)';

        if (data.varyantlar) {

          const targetVariant =
            data.varyantlar.find(
              (v: any) =>
                v.barkodlar?.some(
                  (b: any) =>
                    b.barkod === code
                ) ||
                v.sku === code
            );

          if (targetVariant) {

            resolvedSku =
              targetVariant.sku;

            resolvedStock =
              targetVariant.stokMiktari;

            productName =
              data.modelAdi ||
              'LED PANEL - 24W (PHILIPS)';
          }
        }

        setCurrentProduct({
          name: productName,
          location:
            data.lokasyon ||
            'A-12-04',
          shelf:
            data.raf || '03',
          currentStock:
            resolvedStock,
          sku: resolvedSku,
        });

        setQuantityInput(45);

        setActiveTab('quantity');

        setScannerOpen(false);

      } else {

        setShowSelectionModal(true);
      }

    } catch (error: any) {

      if (
        error.response?.data?.code ===
          'PRODUCT_NOT_FOUND' ||
        error.response?.status === 404
      ) {

        setShowSelectionModal(true);

      } else {

        console.error(
          'Sistem hatası:',
          error
        );
      }

    } finally {

      setIsLoading(false);
    }
  };

  // HIZLI EKLE
  const handleQuickAdd =
    async () => {

      try {

        setIsLoading(true);

        const payload: ManualProductPayload =
          {
            barkod: barcode,
            urunAdi:
              'Hızlı Eklenen Ürün',
            renk: 'Standart',
            beden: 'Standart',
            sku: 'SKU-' + barcode,
            miktar: 1,
          };

        const res =
          await inventoryApi.createManualProduct(
            payload
          );

        addScannedItem({
          success: true,
          sku:
            res.sku ||
            payload.sku,
          yeniStok:
            res.yeniStok ||
            payload.miktar,
        });

        setShowSelectionModal(false);

        setActiveTab('scan');

      } catch (err) {

        console.error(err);

      } finally {

        setIsLoading(false);
      }
    };

  // MANUEL EKLE
  const handleManualFormSubmit =
    async (formData: any) => {

      try {

        setIsLoading(true);

        const payload: ManualProductPayload =
          {
            barkod: barcode,
            urunAdi:
              formData.urunAdi,
            marka:
              formData.marka,
            renk:
              formData.renk,
            beden:
              formData.beden,
            sku:
              formData.sku ||
              barcode,
            miktar:
              Number(
                formData.miktar
              ) || 1,
          };

        const res =
          await inventoryApi.createManualProduct(
            payload
          );

        addScannedItem({
          success: true,
          sku:
            res.sku ||
            payload.sku,
          yeniStok:
            res.yeniStok ||
            payload.miktar,
        });

        setShowManualModal(false);

        setActiveTab('scan');

      } catch (err) {

        console.error(err);

      } finally {

        setIsLoading(false);
      }
    };

  // ONAY
  const handleConfirmQuantity =
    async () => {

      try {

        setIsLoading(true);

        const payload: ManualProductPayload =
          {
            barkod:
              barcode ||
              currentProduct.sku,
            urunAdi:
              currentProduct.name,
            renk: 'Mevcut',
            beden: 'Mevcut',
            sku:
              currentProduct.sku,
            miktar:
              quantityInput,
          };

        const res =
          await inventoryApi.createManualProduct(
            payload
          );

        addScannedItem({
          success: true,
          sku:
            res.sku ||
            currentProduct.sku,
          yeniStok:
            res.yeniStok ||
            quantityInput,
        });

        setBarcode('');

        setActiveTab('scan');

      } catch (err) {

        console.error(
          'Stok onaylanamadı:',
          err
        );

      } finally {

        setIsLoading(false);
      }
    };

  return (

    <div className="min-h-screen bg-[#121212] text-white">

      {/* HEADER */}
      <div className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#181818]/95 backdrop-blur">

        <div className="flex items-center justify-between px-4 py-3">

          <div className="flex items-center gap-3">

            <button className="text-xl text-gray-400">
              ☰
            </button>

            <div>

              <h1 className="text-[15px] font-semibold text-white">
                Mobil Stok Sayım
              </h1>

              <p className="text-[11px] text-gray-500">
                Depo: A
              </p>

            </div>

          </div>

          {/* CAMERA BUTTON */}
          <div
            onClick={() =>
              setScannerOpen(
                !scannerOpen
              )
            }
          >
            <CameraButton />
          </div>

        </div>

      </div>

      {/* CONTENT */}
      <div className="mx-auto w-full max-w-md pb-28">

        {/* SCANNER */}
        {scannerOpen && (

          <div className="px-2 pt-2">

            <div className="overflow-hidden rounded-2xl border border-[#2b2b2b]">

              <BarkodScanner
                onResult={
                  handleBarcode
                }
              />

            </div>

          </div>
        )}

        {/* TAB MENU */}
        <div className="mt-3">

          <TabMenu
            activeTab={activeTab}
            setActiveTab={
              setActiveTab
            }
          />

        </div>

        {/* BODY */}
        <div className="space-y-3 px-3 py-3">

          {/* SCAN TAB */}
          {activeTab === 'scan' && (

            <div className="rounded-2xl border border-[#2b2b2b] bg-[#1a1a1a] p-4">

              <div className="mb-2 flex items-center justify-between">

                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Son Okunan Barkod
                </p>

                {isLoading && (

                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                )}

              </div>

              <div className="rounded-xl border border-[#2f2f2f] bg-[#111111] p-3">

                {barcode ? (

                  <p className="break-all font-mono text-[15px] text-green-400">
                    {barcode}
                  </p>

                ) : (

                  <p className="text-[13px] text-gray-500">
                    Barkod okutulmadı
                  </p>

                )}

              </div>

            </div>
          )}

          {/* DETAIL TAB */}
          {activeTab === 'detail' && (

            <div className="space-y-3 rounded-2xl border border-[#2b2b2b] bg-[#1a1a1a] p-4">

              <h2 className="text-[12px] uppercase tracking-wider text-gray-500">
                Ürün Detayı
              </h2>

              <div className="space-y-2 text-[13px] text-gray-300">

                <p>
                  Ürün:
                  {' '}
                  {currentProduct.name}
                </p>

                <p>
                  SKU:
                  {' '}
                  {currentProduct.sku}
                </p>

                <p>
                  Lokasyon:
                  {' '}
                  {currentProduct.location}
                </p>

                <p>
                  Raf:
                  {' '}
                  {currentProduct.shelf}
                </p>

                <p>
                  Mevcut:
                  {' '}
                  {currentProduct.currentStock}
                </p>

              </div>

            </div>
          )}

          {/* QUANTITY TAB */}
          {activeTab ===
            'quantity' && (

            <div className="space-y-3">

              <div className="rounded-2xl border border-[#2b2b2b] bg-[#1a1a1a] p-4">

                <p className="text-[13px] text-white">
                  {currentProduct.name}
                </p>

                <p className="mt-1 text-[12px] text-gray-500">
                  Raf:
                  {' '}
                  {currentProduct.shelf}
                  {' • '}
                  Lokasyon:
                  {' '}
                  {currentProduct.location}
                </p>

              </div>

              <div className="rounded-2xl border border-[#2b2b2b] bg-[#1a1a1a] p-4">

                <div className="mb-3 flex items-center justify-between">

                  <span className="text-[13px] text-gray-400">
                    Sayım Miktarı
                  </span>

                  <input
                    type="number"
                    value={
                      quantityInput
                    }
                    onChange={(
                      e
                    ) =>
                      setQuantityInput(
                        Math.max(
                          1,
                          Number(
                            e.target
                              .value
                          )
                        )
                      )
                    }
                    className="w-24 bg-transparent text-right text-2xl font-semibold text-white outline-none"
                  />

                </div>

                <div className="grid grid-cols-3 gap-2">

                  <button
                    onClick={() =>
                      setQuantityInput(
                        quantityInput +
                          1
                      )
                    }
                    className="rounded-xl bg-[#2b2b2b] py-3 text-sm"
                  >
                    +1
                  </button>

                  <button
                    onClick={() =>
                      setQuantityInput(
                        quantityInput +
                          10
                      )
                    }
                    className="rounded-xl bg-[#2b2b2b] py-3 text-sm"
                  >
                    +10
                  </button>

                  <button
                    onClick={() =>
                      setQuantityInput(
                        1
                      )
                    }
                    className="rounded-xl bg-[#2b2b2b] py-3 text-sm"
                  >
                    Sil
                  </button>

                </div>

                <button
                  onClick={
                    handleConfirmQuantity
                  }
                  disabled={
                    isLoading
                  }
                  className="mt-4 w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-black disabled:opacity-40"
                >
                  {isLoading
                    ? 'İŞLENİYOR...'
                    : 'ONAYLA'}
                </button>

              </div>

            </div>
          )}

          {/* HISTORY */}
          <div className="rounded-2xl border border-[#2b2b2b] bg-[#1a1a1a] p-4">

            <div className="mb-3 flex items-center justify-between">

              <h2 className="text-[11px] uppercase tracking-wider text-gray-500">
                Son Tarananlar
              </h2>

              <span className="rounded-full bg-[#2a2a2a] px-2 py-1 text-[10px] text-gray-400">

                {scannedItems.length}

              </span>

            </div>

            <ScanHistoryList
              items={
                scannedItems
              }
            />

          </div>

        </div>

      </div>

      {/* PRODUCT NOT FOUND */}
      {showSelectionModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">

          <div className="w-full max-w-sm rounded-2xl border border-[#2b2b2b] bg-[#1a1a1a] p-5">

            <h3 className="text-center text-lg font-semibold">
              Ürün Bulunamadı
            </h3>

            <p className="mt-2 break-all text-center text-sm text-gray-400">

              {barcode}

            </p>

            <div className="mt-5 space-y-2">

              <button
                onClick={
                  handleQuickAdd
                }
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium"
              >
                Yeni Ürün Ekle
              </button>

              <button
                onClick={() => {

                  setShowSelectionModal(
                    false
                  );

                  setActiveTab(
                    'scan'
                  );

                }}
                className="w-full rounded-xl border border-[#3a3a3a] bg-[#242424] py-3 text-sm text-gray-300"
              >
                Tekrar Tara
              </button>

              <button
                onClick={() => {

                  setShowSelectionModal(
                    false
                  );

                  setShowManualModal(
                    true
                  );

                }}
                className="w-full rounded-xl border border-blue-500/20 bg-transparent py-3 text-sm text-blue-400"
              >
                Manuel Ekle
              </button>

            </div>

          </div>

        </div>
      )}

      {/* MANUAL MODAL */}
      {showManualModal && (

        <ManualProductModal
          barkod={barcode}
          onClose={() => {

            setShowManualModal(
              false
            );

            setActiveTab(
              'scan'
            );

          }}
          onSubmit={
            handleManualFormSubmit
          }
        />

      )}

    </div>
  );
}
