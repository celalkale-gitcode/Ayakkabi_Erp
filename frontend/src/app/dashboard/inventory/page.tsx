'use client';

import { useState } from 'react';

import BarkodScanner from '@/features/inventory/components/BarcodeScanner';
import ScanHistoryList from '@/features/inventory/components/ScanHistoryList';
import ManualProductModal from '@/features/inventory/components/ManualProductModal';

// Zustand Store, API ve Gerçek Ürün Tiplerinin Entegrasyonu
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';
import { ManualProductPayload, ScannedItem } from '@/features/inventory/types/inventory.types';

export default function InventoryPage() {
  const [barcode, setBarcode] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Zustand Global Store bağlantısı
  const { scannedItems, addScannedItem } = useInventoryStore();

  // Barkod tarayıcı tetiklendiğinde çalışan ana fonksiyon
  const handleBarcode = async (code: string) => {
    setBarcode(code);

    if (lastScanned === code || isLoading) return;
    setLastScanned(code);
    setTimeout(() => setLastScanned(null), 2000);

    try {
      setIsLoading(true);
      
      // Backend servisinden tarama isteği atılıyor (/inventory/scan)
      const data = await inventoryApi.scanBarcode(code);

      // Veritabanı modelinize göre data.success veya doğrudan gelen veri yapısı kontrolü
      if (data && data.success !== false) {
        
        // ÜRÜN VERİ TABANINDA VAR: 
        // Backend mimarinizden dönen verideki SKU ve güncel stok miktarını güvenli bir şekilde ayıklıyoruz.
        // Eğer API doğrudan güncellenen varyantı veya ana ürünü dönüyorsa ona göre süzme yapıyoruz:
        let resolvedSku = data.sku || code;
        let resolvedStock = typeof data.yeniStok === 'number' ? data.yeniStok : 1;

        // Gelen veri hiyerarşik Product şemasındaysa içindeki ilgili varyantı bul:
        if (data.varyantlar) {
          const targetVariant = data.varyantlar.find((v: any) => 
            v.barkodlar?.some((b: any) => b.barkod === code) || v.sku === code
          );
          if (targetVariant) {
            resolvedSku = targetVariant.sku;
            resolvedStock = targetVariant.stokMiktari;
          }
        }

        const successItem: ScannedItem = {
          success: true,
          sku: resolvedSku,
          yeniStok: resolvedStock
        };

        // Zustand store'a ekle (Böylece listenin en üstüne düşer ve arayüz güncellenir)
        addScannedItem(successItem);

      } else {
        // ÜRÜN VERİTABANINDA YOK: 3 Seçenekli Karar Modalini Aç
        setShowSelectionModal(true);
      }
    } catch (error: any) {
      // API'den PRODUCT_NOT_FOUND veya 404 hatası dönerse doğrudan seçim menüsünü tetikle
      if (error.response?.data?.code === 'PRODUCT_NOT_FOUND' || error.response?.status === 404) {
        setShowSelectionModal(true);
      } else {
        console.error('Barkod taranırken sistem hatası:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Seçim Menüsü Seçenek 1: Hızlıca Yeni Ürün Olarak Ekle (Payload Sözleşmesine Uygun)
  const handleQuickAdd = async () => {
    try {
      setIsLoading(true);
      
      // API'nin beklediği ManualProductPayload yapısı zorunlu alanlarla dolduruluyor
      const payload: ManualProductPayload = {
        barkod: barcode,
        urunAdi: 'Hızlı Eklenen Ürün',
        renk: 'Standart',
        beden: 'Standart',
        sku: 'SKU-' + barcode, // Benzersiz varsayılan SKU üretimi
        miktar: 1
      };

      const res = await inventoryApi.createManualProduct(payload);
      
      // Zustand global state güncelleniyor
      addScannedItem({
        success: true,
        sku: res.sku || payload.sku,
        yeniStok: res.yeniStok || payload.miktar
      });

      setShowSelectionModal(false);
    } catch (err) {
      console.error('Hızlı ürün ekleme başarısız:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Seçim Menüsü Seçenek 3: Detaylı Form Verilerini API'ye Gönderme
  const handleManualFormSubmit = async (formData: any) => {
    try {
      setIsLoading(true);
      
      // ManualProductPayload tip güvenliğine tam eşleme
      const payload: ManualProductPayload = {
        barkod: barcode,
        urunAdi: formData.urunAdi || 'İsimsiz Ürün',
        marka: formData.marka,
        renk: formData.renk || 'Belirtilmedi',
        beden: formData.beden || 'Belirtilmedi',
        sku: formData.sku || 'SKU-' + barcode,
        miktar: Number(formData.miktar) || 1
      };

      const res = await inventoryApi.createManualProduct(payload);

      // Başarılı kayıttan sonra global Zustand listesine işle
      addScannedItem({
        success: true,
        sku: res.sku || payload.sku,
        yeniStok: res.yeniStok || payload.miktar
      });

      setShowManualModal(false);
    } catch (err) {
      console.error('Manuel form kaydı gönderilemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-black text-slate-900">Mobil Stok Sayım</h1>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full max-w-md mx-auto px-2 py-3 space-y-4">
        {/* SCANNER COMPONENT */}
        <div className="w-full">
          <BarkodScanner onResult={handleBarcode} />
        </div>

        {/* OKUNAN BARKOD VE YÜKLENİYOR DURUMU */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <p className="text-xs font-semibold text-slate-500">Okunan Barkod</p>
          <div className="mt-2 bg-slate-50 border rounded-xl p-3 flex justify-between items-center">
            {barcode ? (
              <p className="text-lg font-black text-blue-600 break-all">{barcode}</p>
            ) : (
              <p className="text-slate-400 text-sm">Henüz barkod okunmadı</p>
            )}
            {isLoading && (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>

        {/* TARAMA GEÇMİŞİ (ZUSTAND STORE ÜZERİNDEN AKAR) */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-black text-slate-900">Son Tarananlar</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
              {scannedItems.length}
            </span>
          </div>
          <ScanHistoryList items={scannedItems} />
        </div>
      </div>

      {/* 3 SEÇENEKLİ SEÇİM MODAL MENÜSÜ */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900">Ürün Bulunamadı</h3>
              <p className="text-xs text-slate-500 mt-1 break-all">
                <span className="font-mono font-bold text-slate-700">{barcode}</span> barkodu sistemde kayıtlı değil.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {/* 1. Yeni Ürün Ekle */}
              <button
                onClick={handleQuickAdd}
                className="w-full bg-blue-600 active:scale-95 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm shadow-blue-200"
              >
                1. Yeni Ürün Ekle
              </button>

              {/* 2. Tekrar Tara */}
              <button
                onClick={() => setShowSelectionModal(false)}
                className="w-full bg-slate-100 active:scale-95 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all border border-slate-200"
              >
                2. Tekrar Tara
              </button>

              {/* 3. Manuel Ekle */}
              <button
                onClick={() => {
                  setShowSelectionModal(false);
                  setShowManualModal(true);
                }}
                className="w-full bg-white active:scale-95 text-blue-600 py-3 rounded-xl font-bold text-sm transition-all border border-blue-200"
              >
                3. Manuel Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUEL ÜRÜN OLUŞTURMA MODALİ */}
      {showManualModal && (
        <ManualProductModal
          barkod={barcode}
          onClose={() => setShowManualModal(false)}
          onSubmit={handleManualFormSubmit}
        />
      )}
    </div>
  );
}
