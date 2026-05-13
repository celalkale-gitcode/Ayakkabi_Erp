'use client';

import { useState } from 'react';

// COMPONENTS
import BarkodScanner from '@/features/inventory/components/BarcodeScanner';
import ScanHistoryList from '@/features/inventory/components/ScanHistoryList';
import ManualProductModal from '@/features/inventory/components/ManualProductModal';
import CameraButton from '@/features/inventory/components/CameraButton';
import TabMenu, { TabType } from '@/features/inventory/components/TabMenu';

// STORE & API
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';

import type { ManualProductPayload } from '@/features/inventory/types/inventory.types';

export default function InventoryPage() {
  const [barcode, setBarcode] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('scan');

  const [showManualModal, setShowManualModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [scannerOpen, setScannerOpen] = useState(false);

  const [quantityInput, setQuantityInput] = useState<number>(45);

  const [currentProduct, setCurrentProduct] = useState({
    name: 'LED PANEL - 24W (PHILIPS)',
    location: 'A-12-04',
    shelf: '03',
    currentStock: 42,
    sku: 'STK-45678',
  });

  const { scannedItems, addScannedItem } = useInventoryStore();

  const handleBarcode = async (code: string) => {
    setBarcode(code);

    if (lastScanned === code || isLoading) return;

    setLastScanned(code);

    setTimeout(() => setLastScanned(null), 2000);

    try {
      setIsLoading(true);

      const data = await inventoryApi.scanBarcode(code);

      if (data && data.success !== false) {
        let resolvedSku = data.sku || code;

        let resolvedStock =
          typeof data.yeniStok === 'number' ? data.yeniStok : 42;

        let productName = data.modelAdi || 'LED PANEL - 24W (PHILIPS)';

        if (data.varyantlar) {
          const targetVariant = data.varyantlar.find((v: any) =>
            v.barkodlar?.some((b: any) => b.barkod === code) || v.sku === code
          );

          if (targetVariant) {
            resolvedSku = targetVariant.sku;
            resolvedStock = targetVariant.stokMiktari;
          }
        }

        setCurrentProduct({
          name: productName,
          location: data.lokasyon || 'A-12-04',
          shelf: data.raf || '03',
          currentStock: resolvedStock,
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
        error.response?.data?.code === 'PRODUCT_NOT_FOUND' ||
        error.response?.status === 404
      ) {
        setShowSelectionModal(true);
      } else {
        console.error('Sistem hatası:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    try {
      setIsLoading(true);

      const payload: ManualProductPayload = {
        barkod: barcode,
        urunAdi: 'Hızlı Eklenen Ürün',
        renk: 'Standart',
        beden: 'Standart',
        sku: 'SKU-' + barcode,
        miktar: 1,
      };

      const res = await inventoryApi.createManualProduct(payload);

      addScannedItem({
        success: true,
        sku: res.sku || payload.sku,
        yeniStok: res.yeniStok || payload.miktar,
      });

      setShowSelectionModal(false);
      setActiveTab('scan');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualFormSubmit = async (formData: any) => {
    try {
      setIsLoading(true);

      const payload: ManualProductPayload = {
        barkod: barcode,
        urunAdi: formData.urunAdi,
        marka: formData.marka,
        renk: formData.renk,
        beden: formData.beden,
        sku: formData.sku || barcode,
        miktar: Number(formData.miktar) || 1,
      };

      const res = await inventoryApi.createManualProduct(payload);

      addScannedItem({
        success: true,
        sku: res.sku || payload.sku,
        yeniStok: res.yeniStok || payload.miktar,
      });

      setShowManualModal(false);
      setActiveTab('scan');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmQuantity = async () => {
    try {
      setIsLoading(true);

      const payload: ManualProductPayload = {
        barkod: barcode || currentProduct.sku,
        urunAdi: currentProduct.name,
        renk: 'Mevcut',
        beden: 'Mevcut',
        sku: currentProduct.sku,
        miktar: quantityInput,
      };

      const res = await inventoryApi.createManualProduct(payload);

      addScannedItem({
        success: true,
        sku: res.sku || currentProduct.sku,
        yeniStok: res.yeniStok || quantityInput,
      });

      setBarcode('');
      setActiveTab('scan');
    } catch (err) {
      console.error('Stok onaylanamadı:', err);
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
            <button className="text-xl text-gray-400">☰</button>

            <div>
              <h1 className="text-[15px] font-semibold text-white">
                Mobil Stok Sayım
              </h1>
              <p className="text-[11px] text-gray-500">
                Depo: A
              </p>
            </div>
          </div>

          {/* CAMERA BUTTON - FIXED */}
          <CameraButton
            onClick={() => setScannerOpen(!scannerOpen)}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto w-full max-w-md pb-28">

        {scannerOpen && (
          <div className="px-[8px] pt-[8px]">
            <BarkodScanner onResult={handleBarcode} />
          </div>
        )}

        <div className="mt-3">
          <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="space-y-3 px-3 py-3">

          {/* SCAN */}
          {activeTab === 'scan' && (
            <div className="rounded-2xl border border-[#2b2b2b] bg-[#1a1a1a] p-4">
              <p className="text-[11px] text-gray-500">
                Son Okunan Barkod
              </p>

              <div className="mt-2 rounded-xl bg-[#111] p-3">
                {barcode ? (
                  <p className="font-mono text-green-400">
                    {barcode}
                  </p>
                ) : (
                  <p className="text-gray-500">
                    Barkod okutulmadı
                  </p>
                )}
              </div>
            </div>
          )}

          {/* DETAIL */}
          {activeTab === 'detail' && (
            <div className="rounded-2xl bg-[#1a1a1a] p-4">
              <p>{currentProduct.name}</p>
            </div>
          )}

          {/* QUANTITY */}
          {activeTab === 'quantity' && (
            <div className="rounded-2xl bg-[#1a1a1a] p-4 space-y-3">

              <input
                type="number"
                value={quantityInput}
                onChange={(e) =>
                  setQuantityInput(Math.max(1, Number(e.target.value)))
                }
                className="w-full bg-black p-2"
              />

              <button
                onClick={handleConfirmQuantity}
                className="w-full bg-green-500 py-2 text-black"
              >
                ONAYLA
              </button>

            </div>
          )}

          {/* HISTORY */}
          <ScanHistoryList items={scannedItems} />
        </div>
      </div>

      {/* MODALS */}
      {showManualModal && (
        <ManualProductModal
          barkod={barcode}
          onClose={() => setShowManualModal(false)}
          onSubmit={handleManualFormSubmit}
        />
      )}

      {showSelectionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-[#1a1a1a] p-4 rounded-xl">
            <button onClick={handleQuickAdd}>Yeni Ürün Ekle</button>
          </div>
        </div>
      )}

    </div>
  );
}
