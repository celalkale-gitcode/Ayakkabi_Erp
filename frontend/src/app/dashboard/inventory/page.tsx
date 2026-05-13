'use client';

import { useState, useRef, useEffect } from 'react';

// Bileşen Importları
import BarkodScanner from '@/features/inventory/components/BarcodeScanner';
import ScanHistoryList from '@/features/inventory/components/ScanHistoryList';
import ManualProductModal from '@/features/inventory/components/ManualProductModal';
import CameraButton from '@/features/inventory/components/CameraButton';

// Zustand Store ve API Servis Katmanları
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';
import { ManualProductPayload, ScannedItem } from '@/features/inventory/types/inventory.types';

type TabType = 'scan' | 'detail' | 'quantity';

export default function InventoryPage() {
  const [barcode, setBarcode] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('scan');
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Adet Giriş Ekranı İçin Miktar State'i
  const [quantityInput, setQuantityInput] = useState<number>(45); // Görseldeki varsayılan örnek değer

  // Görseldeki LED Panel Bilgileri Simülasyonu
  const [currentProduct, setCurrentProduct] = useState<{
    name: string;
    location: string;
    shelf: string;
    currentStock: number;
    sku: string;
  }>({
    name: 'LED PANEL - 24W PHILIPS',
    location: 'A-12-04',
    shelf: '03',
    currentStock: 42,
    sku: 'PH-LED-24W'
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
        let productName = data.modelAdi || 'LED PANEL - 24W PHILIPS';

        if (data.varyantlar) {
          const targetVariant = data.varyantlar.find((v: any) => 
            v.barkodlar?.some((b: any) => b.barkod === code) || v.sku === code
          );
          if (targetVariant) {
            resolvedSku = targetVariant.sku;
            resolvedStock = targetVariant.stokMiktari;
            productName = data.modelAdi || 'LED PANEL - 24W PHILIPS';
          }
        }

        setCurrentProduct({
          name: productName,
          location: data.lokasyon || 'A-12-04',
          shelf: data.raf || '03',
          currentStock: resolvedStock,
          sku: resolvedSku
        });
        
        setQuantityInput(1);
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
    <div className="min-h-screen bg-[#111827] text-white flex flex-col font-sans select-none antialiased">
      
      {/* 1. ÜST HEADER BAR (Görseldeki Koyu Ton) */}
      <div className="bg-[#1f2937] border-b border-gray-800 sticky top-0 z-40">
        <div className="px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl text-gray-400 cursor-pointer hover:text-white transition">☰</span>
            <h1 className="text-base font-bold tracking-wider text-gray-100">Mobil Stok Sayım</h1>
          </div>
          <span className="text-[11px] bg-[#374151] border border-gray-700 px-2.5 py-1 rounded-md text-gray-300 font-bold tracking-wide">
            DEPO: MERKEZ
          </span>
        </div>
      </div>

      {/* 2. PRO TAB MENÜ (Alt çizgili aktif mod) */}
      <div className="w-full bg-[#1f2937] border-b border-gray-800 sticky top-[53px] z-40">
        <div className="flex justify-around items-center h-12">
          {/* Barkod Tara */}
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 text-center py-3 text-xs font-black tracking-wider uppercase transition-all relative ${
              activeTab === 'scan' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Barkod Tara
            {activeTab === 'scan' && (
              <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-white rounded-t-full shadow-[0_-2px_10px_rgba(255,255,255,0.5)]" />
            )}
          </button>

          {/* Ürün Detayı */}
          <button
            onClick={() => setActiveTab('detail')}
            className={`flex-1 text-center py-3 text-xs font-black tracking-wider uppercase transition-all relative ${
              activeTab === 'detail' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Ürün Detayı
            {activeTab === 'detail' && (
              <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-white rounded-t-full shadow-[0_-2px_10px_rgba(255,255,255,0.5)]" />
            )}
          </button>

          {/* Adet Giriniz */}
          <button
            onClick={() => setActiveTab('quantity')}
            className={`flex-1 text-center py-3 text-xs font-black tracking-wider uppercase transition-all relative ${
              activeTab === 'quantity' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Adet Giriniz
            {activeTab === 'quantity' && (
              <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-white rounded-t-full shadow-[0_-2px_10px_rgba(255,255,255,0.5)]" />
            )}
          </button>
        </div>
      </div>

      {/* 3. İÇERİK ALANI */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4 overflow-y-auto">

        {/* SEKME A: TARAYICI ALANI */}
        {activeTab === 'scan' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-full">
              <BarkodScanner onResult={handleBarcode} />
            </div>
            <div className="bg-[#1f2937] rounded-xl border border-gray-800 p-4 shadow-xl">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Son Okunan Barkod</p>
              <div className="mt-2 bg-[#111827] border border-gray-800 rounded-lg p-3 flex justify-between items-center">
                {barcode ? (
                  <p className="text-base font-mono font-bold text-blue-400 tracking-wider break-all">{barcode}</p>
                ) : (
                  <p className="text-gray-500 text-sm italic">Barkod okutulması bekleniyor...</p>
                )}
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* SEKME B: GENİŞ ÜRÜN DETAYI MODU */}
        {activeTab === 'detail' && (
          <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-800 space-y-3 shadow-xl animate-in fade-in duration-200">
            <h3 className="font-black text-xs uppercase tracking-widest text-blue-400 border-b border-gray-800 pb-2">Geniş Ürün Detayı</h3>
            {currentProduct ? (
              <div className="text-sm space-y-2.5 font-semibold text-gray-300">
                <p><span className="text-gray-500">Ürün Adı:</span> {currentProduct.name}</p>
                <p><span className="text-gray-500">SKU Kodu:</span> {currentProduct.sku}</p>
                <p><span className="text-gray-500">Mevcut Stok:</span> {currentProduct.currentStock} Adet</p>
                <p><span className="text-gray-500">Fiziksel Konum:</span> {currentProduct.location}</p>
                <p><span className="text-gray-500">Raf ID:</span> {currentProduct.shelf}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-xs italic">Detaylar için lütfen önce bir barkod taratın.</p>
            )}
          </div>
        )}

        {/* SEKME C: ADET GİRİŞ VE RESİMDEKİ PRO YEŞİL BUTON ALANI */}
        {activeTab === 'quantity' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Ürün Künyesi */}
            <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-800 shadow-xl space-y-1.5">
              <p className="text-sm font-black tracking-wide text-gray-100">
                ÜRÜN ADI: {currentProduct?.name}
              </p>
              <div className="flex gap-4 text-xs font-bold text-gray-400">
                <p>Lokasyon: <span className="text-gray-200">{currentProduct?.location}</span></p>
                <p>Raf No: <span className="text-gray-200">{currentProduct?.shelf}</span></p>
              </div>
            </div>

            {/* Sayım Miktar Paneli */}
            <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-800 shadow-xl space-y-4">
              <p className="text-xs font-extrabold tracking-widest text-gray-400 uppercase">
                Mevcut Miktar: <span className="text-emerald-400 font-black text-sm ml-1">{currentProduct?.currentStock} Adet</span>
              </p>
              
              {/* Dev Miktar Giriş Kutusu */}
              <div className="relative flex items-center bg-[#111827] border border-gray-800 rounded-xl overflow-hidden focus-within:border-gray-700 transition">
                <input
                  type="number"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-transparent py-4 text-center text-3xl font-black text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 text-xs font-black text-gray-500 tracking-wider pointer-events-none uppercase">ADET</span>
              </div>

              {/* +1, +10, Sil Buton Takımı */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => setQuantityInput((prev) => prev + 1)}
                  className="bg-[#374151] hover:bg-[#4b5563] active:scale-95 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-gray-200 border border-gray-700/50 transition-all duration-150 shadow-md"
                >
                  +1
                </button>
                <button
                  onClick={() => setQuantityInput((prev) => prev + 10)}
                  className="bg-[#374151] hover:bg-[#4b5563] active:scale-95 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-gray-200 border border-gray-700/50 transition-all duration-150 shadow-md"
                >
                  +10
                </button>
                <button
                  onClick={() => setQuantityInput(1)}
                  className="bg-[#4b5563]/40 hover:bg-[#4b5563]/60 active:scale-95 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-gray-400 border border-gray-700/30 transition-all duration-150"
                >
                  Sil
                </button>
              </div>

              {/* RESİMDEKİ RESMİ, PRO, CANLI YEŞİL ONAYLA BUTONU */}
              <button
                onClick={handleConfirmQuantity}
                disabled={isLoading}
                className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 active:scale-[0.97] py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-150 text-white border border-[#10b981]/20 shadow-lg shadow-emerald-950/40"
              >
                {isLoading ? 'İŞLENİYOR...' : 'ONAYLA'}
              </button>
            </div>
          </div>
        )}

        {/* REZERV LİSTE: GEÇMİŞ TABLOSU */}
        <div className="bg-[#1f2937] rounded-xl border border-gray-800 p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Son Tarananlar</h2>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-md font-black border border-blue-500/20 tracking-wider">
              TOPLAM: {scannedItems.length}
            </span>
          </div>
          <div className="max-h-40 overflow-y-auto rounded-lg">
            <ScanHistoryList items={scannedItems} />
          </div>
        </div>
      </div>

      {/* 3 SEÇENEKLİ SEÇİM MODAL MENÜSÜ */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1f2937] border border-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wide">Ürün Bulunamadı</h3>
              <p className="text-xs text-gray-400 mt-1 break-all">
                <span className="font-mono font-bold text-gray-300">{barcode}</span> barkodu sistemde kayıtlı değil.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button onClick={handleQuickAdd} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                1. Yeni Ürün Ekle
              </button>
              <button onClick={() => { setShowSelectionModal(false); setActiveTab('scan'); }} className="w-full bg-gray-800 text-gray-300 py-3 rounded-xl font-bold text-sm transition-all border border-gray-700 active:scale-95">
                2. Tekrar Tara
              </button>
              <button onClick={() => { setShowSelectionModal(false); setShowManualModal(true); }} className="w-full bg-transparent text-blue-400 py-3 rounded-xl font-bold text-sm transition-all border border-blue-500/20 active:scale-95">
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
