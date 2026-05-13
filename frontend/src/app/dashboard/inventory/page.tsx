'use client';

import { useState, useRef, useEffect } from 'react';

// Bileşen ve Kütüphane Importları
import BarkodScanner from '@/features/inventory/components/BarcodeScanner';
import ScanHistoryList from '@/features/inventory/components/ScanHistoryList';
import ManualProductModal from '@/features/inventory/components/ManualProductModal';
import CameraButton from '@/features/inventory/components/CameraButton';

// Zustand Store ve API Servis Katmanları
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';
import { ManualProductPayload, ScannedItem } from '@/features/inventory/types/inventory.types';

// Tip Tanımları (Tab Menüsü İçin)
type TabType = 'scan' | 'detail' | 'quantity';

export default function InventoryPage() {
  const [barcode, setBarcode] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('scan'); // Varsayılan olarak tarayıcı açık başlar
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Adet Giriş Ekranı İçin Miktar State'i
  const [quantityInput, setQuantityInput] = useState<number>(1);

  // Gerçek Ürün Bilgisi Simülasyon Verisi (Görseldeki LED Panel Bilgileri)
  const [currentProduct, setCurrentProduct] = useState<{
    name: string;
    location: string;
    shelf: string;
    currentStock: number;
    sku: string;
  } | null>(null);

  // Zustand Store Bağlantısı
  const { scannedItems, addScannedItem } = useInventoryStore();

  // BARKOD TARAYICI TETİKLENDİĞİNDE ÇALIŞAN ANA FONKSİYON
  const handleBarcode = async (code: string) => {
    setBarcode(code);

    if (lastScanned === code || isLoading) return;
    setLastScanned(code);
    setTimeout(() => setLastScanned(null), 2000);

    try {
      setIsLoading(true);
      
      // Backend API sorgusu atılıyor
      const data = await inventoryApi.scanBarcode(code);

      if (data && data.success !== false) {
        // DURUM A: Ürün sistemde var.
        // Hiyerarşik mimarinize göre varyant veya stok bilgisini çözümlüyoruz
        let resolvedSku = data.sku || code;
        let resolvedStock = typeof data.yeniStok === 'number' ? data.yeniStok : 1;
        let productName = 'Kayıtlı Ürün';

        if (data.varyantlar) {
          const targetVariant = data.varyantlar.find((v: any) => 
            v.barkodlar?.some((b: any) => b.barkod === code) || v.sku === code
          );
          if (targetVariant) {
            resolvedSku = targetVariant.sku;
            resolvedStock = targetVariant.stokMiktari;
            productName = data.modelAdi || 'Kayıtlı Ürün';
          }
        }

        // Aktif ürünü ekrana basmak üzere hafızaya al ve otomatik olarak "Adet Giriniz" sekmesine geç
        setCurrentProduct({
          name: productName,
          location: data.lokasyon || 'A-12-04',
          shelf: data.raf || '03',
          currentStock: resolvedStock,
          sku: resolvedSku
        });
        
        setQuantityInput(1); // Miktar kutusunu sıfırla
        setActiveTab('quantity'); // Görseldeki gibi adet girme alanını aç

      } else {
        // DURUM B: Ürün sistemde kayıtlı değil
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

  // SEÇENEK 1: Hızlıca Yeni Ürün Ekleme İsteği
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

  // SEÇENEK 3: Detaylı Form Verilerini Backend'e Gönderme
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

  // ADET GİRİNİZ EKRANI: BÜYÜK YEŞİL "ONAYLA" BUTONU AKIŞI
  const handleConfirmQuantity = async () => {
    if (!currentProduct) return;
    try {
      setIsLoading(true);

      // Sayım stoğunu API sözleşmenize göre güncellemek için istek atılıyor
      const payload: ManualProductPayload = {
        barkod: barcode,
        urunAdi: currentProduct.name,
        renk: 'Mevcut',
        beden: 'Mevcut',
        sku: currentProduct.sku,
        miktar: quantityInput
      };

      // API'ye gönderip güncel veriyi Zustand'a senkronize ediyoruz
      const res = await inventoryApi.createManualProduct(payload);

      addScannedItem({
        success: true,
        sku: res.sku || currentProduct.sku,
        yeniStok: res.yeniStok || (currentProduct.currentStock + quantityInput)
      });

      // İşlem başarılı olduktan sonra kullanıcıyı tekrar tarama ekranına geri döndür
      setCurrentProduct(null);
      setBarcode('');
      setActiveTab('scan');
    } catch (err) {
      console.error('Stok onaylanamadı:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans">
      
      {/* 1. ÜST HEADER BAR (Koyu Tema) */}
      <div className="bg-[#1e293b] border-b border-slate-700/50 sticky top-0 z-40">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">☰</span>
            <h1 className="text-lg font-bold tracking-wide">Mobil Stok Sayım</h1>
          </div>
          <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-slate-300 font-medium">
            Depo: A
          </span>
        </div>
      </div>

      {/* 2. PROFESYONEL TAB MENÜ BİLEŞENİ */}
      <div className="w-full bg-[#1e293b] border-b border-slate-700/50 sticky top-[49px] z-40">
        <div className="flex justify-around items-center h-12">
          {/* Barkod Tara */}
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 text-center py-3 text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'scan' ? 'text-white' : 'text-slate-400'
            }`}
          >
            Barkod Tara
            {activeTab === 'scan' && (
              <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-white rounded-t-full" />
            )}
          </button>

          {/* Ürün Detayı */}
          <button
            onClick={() => setActiveTab('detail')}
            className={`flex-1 text-center py-3 text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'detail' ? 'text-white' : 'text-slate-400'
            }`}
          >
            Ürün Detayı
            {activeTab === 'detail' && (
              <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-white rounded-t-full" />
            )}
          </button>

          {/* Adet Giriniz */}
          <button
            onClick={() => setActiveTab('quantity')}
            className={`flex-1 text-center py-3 text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'quantity' ? 'text-white' : 'text-slate-400'
            }`}
          >
            Adet Giriniz
            {activeTab === 'quantity' && (
              <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-white rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* 3. DİNAMİK İÇERİK ALANI */}
      <div className="flex-1 w-full max-w-md mx-auto px-3 py-4 space-y-4 overflow-y-auto">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Sayım Ekranı</p>

        {/* SEKME A: KAMERA VE TARAYICI MODU */}
        {activeTab === 'scan' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-full">
              <BarkodScanner onResult={handleBarcode} />
            </div>
            {/* Okunan Barkod Bilgi Kutusu */}
            <div className="bg-[#1e293b] rounded-xl border border-slate-700/60 p-4">
              <p className="text-xs font-semibold text-slate-400">Son Okunan Barkod</p>
              <div className="mt-2 bg-[#0f172a] border border-slate-800 rounded-lg p-3 flex justify-between items-center">
                {barcode ? (
                  <p className="text-base font-mono font-bold text-blue-400 break-all">{barcode}</p>
                ) : (
                  <p className="text-slate-500 text-sm italic">Barkod bekleniyor...</p>
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
          <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/60 space-y-3 animate-in fade-in duration-200">
            <h3 className="font-bold text-base border-b border-slate-700 pb-2 text-blue-400">Geniş Ürün Detayı</h3>
            {currentProduct ? (
              <div className="text-sm space-y-2 font-medium text-slate-300">
                <p><span className="text-slate-500">Ürün Adı:</span> {currentProduct.name}</p>
                <p><span className="text-slate-500">SKU Kodu:</span> {currentProduct.sku}</p>
                <p><span className="text-slate-500">Güncel Stok:</span> {currentProduct.currentStock} Adet</p>
                <p><span className="text-slate-500">Fiziksel Konum:</span> {currentProduct.location}</p>
                <p><span className="text-slate-500">Raf ID:</span> {currentProduct.shelf}</p>
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">Detaylarını görmek için lütfen önce bir barkod taratın.</p>
            )}
          </div>
        )}

        {/* SEKME C: ADET GİRİŞ VE ONAY MODU (Görseldeki Panel Düzeni) */}
        {activeTab === 'quantity' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Ürün Künyesi */}
            <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/60 space-y-1">
              <p className="text-sm font-bold text-slate-200">
                URÜN ADI: {currentProduct?.name || 'LED PANEL - 24W (PHILIPS)'}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Lokasyon: {currentProduct?.location || 'A-12-04'}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Raf: {currentProduct?.shelf || '03'}
              </p>
            </div>

            {/* Sayım Girdi Kontrolleri */}
            <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/60 space-y-4">
              <p className="text-sm font-bold text-slate-300">
                Mevcut: <span className="text-emerald-400">{currentProduct?.currentStock || 42} Adet</span>
              </p>
              
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400 font-bold whitespace-nowrap">Miktar Girin:</span>
                <input
                  type="number"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-black text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Hızlı Ekleme ve Silme Tuş Takımı */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setQuantityInput((prev) => prev + 1)}
                  className="bg-slate-700 hover:bg-slate-600 active:scale-95 py-2.5 rounded-lg font-bold text-sm transition"
                >
                  +1
                </button>
                <button
                  onClick={() => setQuantityInput((prev) => prev + 10)}
                  className="bg-slate-700 hover:bg-slate-600 active:scale-95 py-2.5 rounded-lg font-bold text-sm transition"
                >
                  +10
                </button>
                <button
                  onClick={() => setQuantityInput(1)}
                  className="bg-slate-600/50 hover:bg-slate-600 active:scale-95 py-2.5 rounded-lg font-bold text-sm text-slate-300 transition"
                >
                  Sil
                </button>
              </div>

              {/* ONAYLA BUTONU */}
              <button
                onClick={handleConfirmQuantity}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 active:scale-[0.98] py-3 rounded-xl font-extrabold text-base tracking-wider transition-all mt-2 text-white shadow-lg shadow-emerald-900/20"
              >
                {isLoading ? 'KAYDEDİLİYOR...' : 'ONAYLA'}
              </button>
            </div>
          </div>
        )}

        {/* GLOBAL SAYIM GEÇMİŞİ LİSTESİ */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/60 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-black tracking-wide text-slate-300">Son Tarananlar</h2>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30">
              {scannedItems.length}
            </span>
          </div>
          <ScanHistoryList items={scannedItems} />
        </div>
      </div>

      {/* 3 SEÇENEKLİ SEÇİM MODAL MENÜSÜ */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-sm rounded-2xl shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="text-base font-black text-white">Ürün Bulunamadı</h3>
              <p className="text-xs text-slate-400 mt-1 break-all">
                <span className="font-mono font-bold text-slate-300">{barcode}</span> barkodu sistemde kayıtlı değil.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button onClick={handleQuickAdd} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95">
                1. Yeni Ürün Ekle
              </button>
              <button onClick={() => { setShowSelectionModal(false); setActiveTab('scan'); }} className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl font-bold text-sm transition-all border border-slate-700 active:scale-95">
                2. Tekrar Tara
              </button>
              <button onClick={() => { setShowSelectionModal(false); setShowManualModal(true); }} className="w-full bg-transparent text-blue-400 py-3 rounded-xl font-bold text-sm transition-all border border-blue-500/30 active:scale-95">
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
