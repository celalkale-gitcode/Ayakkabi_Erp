'use client';

import React, { useState } from 'react';
import styles from './inventory.module.css'; 
import ProductDetailCard from '@/features/inventory/components/ProductDetailCard'; 
import QuantityInputCard from '@/features/inventory/components/QuantityInputCard';
import BarcodeScanner from '@/features/inventory/components/BarcodeScanner';
import TabMenu, { TabType } from '@/features/inventory/components/TabMenu';
import ScanHistoryList from '@/features/inventory/components/ScanHistoryList';
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';

export default function InventoryPage() {
  const [miktar, setMiktar] = useState<string>('1');
  const [activeTab, setActiveTab] = useState<TabType>('scan');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // DİNAMİK ÜRÜN BİLGİSİ STATE'LERİ
  const [lastScannedProductBarcode, setLastScannedProductBarcode] = useState<string>('');
  const [dbProductInfo, setDbProductInfo] = useState<{ urunAdi: string; sku: string } | null>(null);

  // Zustand Store entegrasyonu (Doğrudan store dinleniyor)
  const { 
    scannedItems, 
    activeLocation, 
    addScannedItem,
    setActiveLocation 
  } = useInventoryStore();

  // Barkod Okunduğunda Çalışan Ana Fonksiyon
  const handleBarcodeResult = async (barcode: string) => {
    if (!barcode) return;
    // Donanımlardan veya cihazlardan gelebilecek Enter/Tab gizli karakterlerini uçur
    const cleanBarcode = barcode.replace(/[\n\r\t]/g, '').trim().toUpperCase();
    if (!cleanBarcode) return;

    // 1. ADIM: EĞER HENÜZ RAF SEÇİLMEDİYSE (İLK TARAMA RAF KABUL EDİLİR)
    if (!activeLocation) {
      setIsLoading(true);
      try {
        const detectedLocation = {
          id: cleanBarcode, // Backend 'OR' yapısı sayesinde hem string hem UUID kaldırabilir
          konumKodu: cleanBarcode,
          tanimliBeden: 'Yükleniyor...',
          isFull: false,
          checkDigit: cleanBarcode.slice(-1) // Son karakter kontrol kodu varsayımı
        };
        
        // Store doğrudan güncelleniyor, böylece TabMenu kilitleri anında açılıyor
        setActiveLocation(detectedLocation);
        setActiveTab('scan');
      } catch (err) {
        console.error('Raf konumu işlenirken hata:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. ADIM: RAF ZATEN SEÇİLİYSE (BU BİR ÜRÜN BARKODUDUR)
    setIsLoading(true);
    try {
      setLastScannedProductBarcode(cleanBarcode);
      
      // Backend'deki akıllı yer önerisi endpoint'ine istek atıp gerçek ürünü yakalıyoruz
      const productData = await inventoryApi.suggestLocation(cleanBarcode);
      
      if (productData && productData.success !== false) {
        setDbProductInfo({
          urunAdi: productData.urunAdi || `SKU: ${productData.sku || 'Ayakkabı Varyantı'}`,
          sku: productData.sku || cleanBarcode
        });
      } else {
        setDbProductInfo({
          urunAdi: "Bilinmeyen Ürün (Sistemde Kayıtlı Değil)",
          sku: cleanBarcode
        });
      }
      
      // KRİTİK ÇÖZÜM: Ürün hafızaya başarıyla alındığı an Miktar Giriş tabına yönlendir
      setActiveTab('quantity');
    } catch (error) {
      console.error("Ürün bilgileri veritabanından çekilemedi:", error);
      setDbProductInfo({ urunAdi: "Ürün Veritabanı Bağlantı Hatası", sku: cleanBarcode });
      setActiveTab('quantity'); // Hata olsa dahi miktar girişine izin ver
    } finally {
      setIsLoading(false);
    }
  };

  // Miktar onaylandığında veritabanına kaydeden fonksiyon
  const handleOnayla = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Mobil klavye enter koruması

    // Kontroller doğrudan güncel Store durumundan yapılıyor
    if (!activeLocation) {
      alert('Hata: Aktif bir raf konumu bulunamadı! Lütfen önce raf barkodunu okutun.');
      setActiveTab('scan');
      return;
    }

    if (!lastScannedProductBarcode) {
      alert('Hata: Taranmış bir ürün barkodu bulunamadı! Lütfen ürün barkodunu tekrar okutun.');
      setActiveTab('scan');
      return;
    }

    setIsLoading(true);
    try {
      const numericQuantity = parseInt(miktar, 10) || 1;

      // Backend API'ye gerçek taranan dataları basıyoruz
      const response = await inventoryApi.scanBarcode(
        lastScannedProductBarcode, 
        numericQuantity,           
        activeLocation.konumKodu   
      );
      
      // Zustand global listesine ve geçmişe kaydet
      addScannedItem({
        sku: response?.sku || dbProductInfo?.sku || lastScannedProductBarcode,
        yeniStok: response?.raftakiYeniStok || numericQuantity,
        miktar: numericQuantity,
        konumKodu: activeLocation.konumKodu,
        barkod: lastScannedProductBarcode
      });

      // Başarılı işlem sonrası formu ve geçici ürün state'lerini temizle
      setMiktar('1');
      setLastScannedProductBarcode('');
      setDbProductInfo(null);
      setActiveTab('scan'); // Tarama ana ekranına temiz ve kontrollü dönüş yap
    } catch (error: any) {
      console.error('Veritabanı kayıt hatası:', error);
      alert(error?.response?.data?.message || error?.message || 'Ürün veritabanına işlenirken bir hata oldu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className="bg-[#121212] min-h-screen text-white flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-[#1a1a1a] border-b border-zinc-800/40">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-bold tracking-wider uppercase text-zinc-200">
              Mobil Stok Operasyonu
            </h1>
          </div>
          
          {activeLocation ? (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-[12px] font-bold font-mono bg-zinc-900 px-2.5 py-1 rounded-l-lg border border-zinc-800 text-emerald-400 border-r-0">
                  Raf: {activeLocation.konumKodu}
                </span>
                <span className="text-[12px] font-bold font-mono bg-zinc-800 px-2 py-1 rounded-r-lg border border-zinc-700 text-amber-400">
                  {activeLocation.checkDigit || '0'}
                </span>
              </div>
              {lastScannedProductBarcode && (
                <span className="text-[10px] text-zinc-500 font-mono mt-1 bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800/80">
                  Ürün: {lastScannedProductBarcode}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[12px] font-bold font-mono bg-zinc-900/50 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-500 animate-pulse">
              Konum Okutun
            </span>
          )}
        </div>

        {/* TAB MENU */}
        <TabMenu 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          disabledTabs={!activeLocation ? ['detail', 'quantity'] : []} 
        />

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoading && (
            <div className="text-center text-xs text-zinc-500 font-mono py-1 animate-pulse">
              Veritabanı senkronizasyonu sağlanıyor...
            </div>
          )}

          {activeTab === 'scan' && (
            <div className="space-y-4">
              <BarcodeScanner onResult={handleBarcodeResult} />
              <ScanHistoryList items={scannedItems} />
            </div>
          )}

          {activeTab === 'detail' && (
            <ProductDetailCard 
              urunAdi={dbProductInfo?.urunAdi || "Ürün Seçilmedi veya Barkod Okutulmadı"} 
              lokasyon={activeLocation?.konumKodu || '-'} 
              raf={activeLocation?.konumKodu.split('-').pop() || '-'} 
            />
          )}

          {activeTab === 'quantity' && (
            <form onSubmit={handleOnayla}>
              <QuantityInputCard 
                mevcutStok={activeLocation ? 12 : 0} 
                miktar={miktar} 
                setMiktar={setMiktar} 
                onOnayla={handleOnayla} 
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
