'use client';

import { useState, useRef, useEffect } from 'react';

// Bileşen Importları
import BarkodScanner from '@/features/inventory/components/BarcodeScanner';
import ScanHistoryList from '@/features/inventory/components/ScanHistoryList';
import ManualProductModal from '@/features/inventory/components/ManualProductModal';
import CameraButton from '@/features/inventory/components/CameraButton';
import TabMenu, { TabType } from './TabMenu'; // Güncellenen TabMenu bileşeni import edildi

// Zustand Store ve API Servis Katmanları
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';
import { ManualProductPayload, ScannedItem } from '@/features/inventory/types/inventory.types';

export default function InventoryPage() {
  const [barcode, setBarcode] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('scan');
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Görseldeki varsayılan miktar değeri (45)
  const [quantityInput, setQuantityInput] = useState<number>(45);

  // Görseldeki LED Panel Bilgileri
  const [currentProduct, setCurrentProduct] = useState<{
    name: string;
    location: string;
    shelf: string;
    currentStock: number;
    sku: string;
  }>({
    name: 'LED PANEL - 24W (PHILIPS)',
    location: 'A-12-04',
    shelf: '03',
    currentStock: 42,
    sku: 'STK-45678'
  });

  // Zustand Store Bağlantısı
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
        let resolvedStock = typeof data.yeniStok === 'number' ? data.yeniStok : 42;
        let productName = data.modelAdi || 'LED PANEL - 24W (PHILIPS)';

        if (data.varyantlar) {
          const targetVariant = data.varyantlar.find((v: any) =>
            v.barkodlar?.some((b: any) => b.barkod === code) || v.sku === code
          );
          if (targetVariant) {
            resolvedSku = targetVariant.sku;
            resolvedStock = targetVariant.stokMiktari;
            productName = data.modelAdi || 'LED PANEL - 24W (PHILIPS)';
          }
        }

        setCurrentProduct({
          name: productName,
          location: data.lokasyon || 'A-12-04',
          shelf: data.raf || '03',
          currentStock: resolvedStock,
          sku: resolvedSku
        });
        setQuantityInput(45); // Varsayılan görsel değeri
        setActiveTab('quantity');
      } else {
        setShowSelectionModal(true);
      }
    } catch (error: any) {
      if (error.response?.data?.code === 'PRODUCT_NOT_FOUND' || error.response?.status === 404) {
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
        miktar: 1
      };
      const res = await inventoryApi.createManualProduct(payload);
      addScannedItem({
        success: true,
        sku: res.sku || payload.sku,
        yeniStok: res.yeniStok || payload.miktar
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
        miktar: Number(formData.miktar) || 1
      };
      const res = await inventoryApi.createManualProduct(payload);
      addScannedItem({
        success: true,
        sku: res.sku || payload.sku,
        yeniStok: res.yeniStok || payload.miktar
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
    if (!currentProduct) return;
    try {
      setIsLoading(true);
      const payload: ManualProductPayload = {
        barkod: barcode || currentProduct.sku,
        urunAdi: currentProduct.name,
        renk: 'Mevcut',
        beden: 'Mevcut',
        sku: currentProduct.sku,
        miktar: quantityInput
      };
      const res = await inventoryApi.createManualProduct(payload);
      addScannedItem({
        success: true,
        sku: res.sku || currentProduct.sku,
        yeniStok: res.yeniStok || quantityInput
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
    // Tüm sayfa görseldeki gibi mat, koyu antrasit/siyah [#121212] yapıldı
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans select-none antialiased">
      
      {/* 1. ÜST HEADER BAR (Görseldeki Koyu Ton ve İnce Alt Çizgi) */}
      <div className="bg-[#1c1c1c] border-b border-[#2d2d2d] sticky top-0 z-40">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl text-gray-300 cursor-pointer hover:text-white transition">☰</span>
            <h1 className="text-sm font-medium tracking-wide text-gray-200">Mobil Stok Sayım</h1>
          </div>
          <span className="text-[12px] text-gray-300 font-normal">
            Depo: A
          </span>
        </div>
      </div>

      {/* Ana Mobil Çerçeve Kapsayıcısı */}
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col">
        
        {/* Taram Ekranı Başlığı ve Kamera Alanı */}
        <div className="px-4 pt-3 space-y-2">
          <h2 className="text-[12px] text-gray-400 font-normal">Sayım Ekranı</h2>
          
          {/* Kamera / Barkod Tarama Çerçevesi */}
          <div className="relative w-full aspect-[16/9] bg-[#1a1a1a] rounded-md border border-[#2d2d2d] overflow-hidden flex items-center justify-center">
            <BarkodScanner onResult={handleBarcode} />
            {/* Görseldeki kırmızı lazer simülasyon çizgisi */}
            <div className="absolute inset-x-0 h-[1.5px] bg-red-500 opacity-80 shadow-[0_0_8px_#ef4444]" />
          </div>
        </div>

        {/* 2. PRO TAB MENÜ (Kamera alanının tam altına yerleştirildi) */}
        <div className="mt-3">
          <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* 3. DİNAMİK İÇERİK ALANI */}
        <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
          
          {/* SEKME A: BARKOD TARA AKTİF MODU İÇİN EK BİLGİ KARTLARI */}
          {activeTab === 'scan' && (
            <div className="bg-[#1c1c1c] rounded-md border border-[#2d2d2d] p-3 space-y-2">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Son Okunan Barkod</p>
              <div className="bg-[#121212] border border-[#2d2d2d] rounded p-2 flex justify-between items-center">
                {barcode ? (
                  <p className="text-sm font-mono text-gray-300 break-all">{barcode}</p>
                ) : (
                  <p className="text-gray-500 text-xs italic">Okutma bekleniyor...</p>
                )}
                {isLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              </div>
            </div>
          )}

          {/* SEKME B: GENİŞ ÜRÜN DETAYI MODU */}
          {activeTab === 'detail' && (
            <div className="bg-[#1c1c1c] p-4 rounded-md border border-[#2d2d2d] space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-[#2d2d2d] pb-2">Ürün Künyesi</h3>
              <div className="text-xs space-y-1.5 text-gray-300">
                <p><span className="text-gray-500">Ürün Adı:</span> {currentProduct.name}</p>
                <p><span className="text-gray-500">SKU Kodu:</span> {currentProduct.sku}</p>
                <p><span className="text-gray-500">Mevcut Stok:</span> {currentProduct.currentStock} Adet</p>
                <p><span className="text-gray-500">Lokasyon:</span> {currentProduct.location}</p>
                <p><span className="text-gray-500">Raf ID:</span> {currentProduct.shelf}</p>
              </div>
            </div>
          )}

          {/* SEKME C VEYA GENEL GÖRÜNÜM: ÜRÜN BİLGİLERİ VE MİKTAR PANELİ */}
          {/* Görselde sekmelerin altında direkt bu panel açık olduğu için activeTab koşulundan bağımsız veya quantity sekmesinde gösterilebilir */}
          {activeTab === 'quantity' && (
            <div className="space-y-3">
              {/* Ürün Künyesi Kartı */}
              <div className="bg-[#1c1c1c] p-3 rounded-md border border-[#2d2d2d] space-y-1 text-left">
                <p className="text-[13px] font-medium text-gray-200">
                  ÜRÜN ADI: {currentProduct?.name}
                </p>
                <p className="text-[12px] text-gray-400">
                  Lokasyon: {currentProduct?.location}
                </p>
                <p className="text-[12px] text-gray-400">
                  Raf: {currentProduct?.shelf}
                </p>
              </div>

              {/* Sayım Miktar Paneli */}
              <div className="bg-[#1c1c1c] p-3 rounded-md border border-[#2d2d2d] space-y-3">
                <p className="text-[12px] text-gray-300">
                  Mevcut: {currentProduct?.currentStock} Adet
                </p>

                {/* Dev Miktar Giriş Kutusu */}
                <div className="flex items-center justify-between bg-[#121212] border border-[#2d2d2d] rounded-md px-3 py-1.5">
                  <span className="text-[12px] text-gray-400">Miktar Girin:</span>
                  <input
                    type="number"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(Math.max(1, Number(e.target.value)))}
                    className="w-24 bg-transparent text-right text-base font-normal text-white focus:outline-none"
                  />
                </div>

                {/* +1, +10, Sil Buton Takımı */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setQuantityInput((prev) => prev + 1)}
                    className="bg-[#2a2a2a] hover:bg-[#333333] py-2.5 rounded text-xs text-gray-200 border border-[#3d3d3d] transition-colors"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => setQuantityInput((prev) => prev + 10)}
                    className="bg-[#2a2a2a] hover:bg-[#333333] py-2.5 rounded text-xs text-gray-200 border border-[#3d3d3d] transition-colors"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => setQuantityInput(1)}
                    className="bg-[#2a2a2a] hover:bg-[#333333] py-2.5 rounded text-xs text-gray-400 border border-[#3d3d3d] transition-colors"
                  >
                    Sil
                  </button>
                </div>

                {/* GÖRSELDEKİ CANLI YEŞİL ONAYLA BUTONU */}
                <button
                  onClick={handleConfirmQuantity}
                  disabled={isLoading}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 py-3 rounded-md font-medium text-xs tracking-wider uppercase transition-colors text-white"
                >
                  {isLoading ? 'İŞLENİYOR...' : 'ONAYLA'}
                </button>
              </div>
            </div>
          )}

          {/* REZERV GEÇMİŞ TABLOSU (Sayfa altında minimal liste) */}
          <div className="bg-[#1c1c1c] rounded-md border border-[#2d2d2d] p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Son Tarananlar</h2>
              <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
                TOPLAM: {scannedItems.length}
              </span>
            </div>
            <div className="max-h-24 overflow-y-auto">
              <ScanHistoryList items={scannedItems} />
            </div>
          </div>

        </div>
      </div>

      {/* ÜRÜN BULUNAMADI MODALİ */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-[#2d2d2d] w-full max-w-sm rounded-md p-4 space-y-3">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white uppercase">Ürün Bulunamadı</h3>
              <p className="text-xs text-gray-400 break-all">
                <span className="font-mono text-gray-300">{barcode}</span> barkodu kayıtlı değil.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleQuickAdd} className="w-full bg-blue-600 text-white py-2 rounded text-xs font-medium">
                1. Yeni Ürün Ekle
              </button>
              <button onClick={() => { setShowSelectionModal(false); setActiveTab('scan'); }} className="w-full bg-[#2a2a2a] text-gray-300 py-2 rounded text-xs border border-[#3d3d3d]">
                2. Tekrar Tara
              </button>
              <button onClick={() => { setShowSelectionModal(false); setShowManualModal(true); }} className="w-full bg-transparent text-blue-400 py-2 rounded text-xs border border-blue-500/30">
                3. Manuel Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUEL DETAY FORMU MODALİ */}
      {showManualModal && (
        <ManualProductModal
          barkod={barcode}
          onClose={() => { setShowManualModal(false); setActiveTab('scan'); }}
          onSubmit={handleManualFormSubmit}
        />
      )}
    </div>
  );
}
