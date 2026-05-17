'use client';

import React, { useState, useRef, useEffect } from 'react';
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

  // DONANIM KORUMASI: El terminali Enter bastığında React state'i kaybetmesin diye Ref kullanıyoruz
  const activeLocationRef = useRef<any>(null);
  const { 
    scannedItems, 
    activeLocation, 
    addScannedItem,
    setActiveLocation 
  } = useInventoryStore();

  // Zustand Store ile Ref senkronizasyonu
  useEffect(() => {
    activeLocationRef.current = activeLocation;
  }, [activeLocation]);

  // Barkod Okunduğunda Çalışan Ana Fonksiyon
  const handleBarcodeResult = async (barcode: string) => {
    if (!barcode) return;
    const cleanBarcode = barcode.replace(/[\n\r\t]/g, '').trim().toUpperCase();
    if (!cleanBarcode) return;

    // 1. ADIM: EĞER HENÜZ RAF SEÇİLMEDİYSE (İLK TARAMA RAF KABUL EDİLİR)
    if (!activeLocationRef.current) {
      setIsLoading(true);
      try {
        // ARKA PLAN ENTEGRASYONU: Ham barkod metnini doğrudan konum kodu yapıyoruz
        // Backend'deki yeni servisimiz OR bloğu sayesinde bu string'i otomatik tanıyacak.
        const detectedLocation = {
          id: cleanBarcode, // Backend 'konumKodu' alanı ile eşleşecek ham string
          konumKodu: cleanBarcode,
          tanimliBeden: 'Belirleniyor...',
          isFull: false,
          checkDigit: cleanBarcode.slice(-1) // Son karakter kontrol karakteri varsayımı
        };
        
        activeLocationRef.current = detectedLocation;
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
      
      // DİNAMİK VERİ ÇEKME: Akıllı yer önerisi endpoint'ini tetikleyerek 
      // veritabanındaki gerçek ürünün varyant/ürün adına ulaşıyoruz
      const productData = await inventoryApi.suggestLocation(cleanBarcode);
      
      if (productData && productData.success !== false) {
        setDbProductInfo({
          // Not: Backend suggest API'nize ürün adı alanını eklemediyseniz default yedek isim basar
          urunAdi: productData.urunAdi || `SKU: ${productData.sku || 'Ayakkabı Varyantı'}`,
          sku: productData.sku || cleanBarcode
        });
      } else {
        // Ürün sistemde yoksa veya manuel giriş gerekliyse
        setDbProductInfo({
          urunAdi: "Bilinmeyen Ürün (Sistemde Kayıtlı Değil)",
          sku: cleanBarcode
        });
      }
      
      // Ürün başarıyla okunduktan sonra miktar giriş ekranına yönlendir
      setActiveTab('quantity');
    } catch (error) {
      console.error("Ürün bilgileri veritabanından çekilemedi:", error);
      setDbProductInfo({ urunAdi: "Okuma Hatası (Veritabanı Bağlantısı)", sku: cleanBarcode });
      setActiveTab('quantity');
    } finally {
      setIsLoading(false);
    }
  };

  // Miktar onaylandığında veritabanına kaydeden fonksiyon
  const handleOnayla = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Form yenilenmesini engelle (Terminal Enter koruması)

    const currentLoc = activeLocationRef.current;

    if (!currentLoc || !lastScannedProductBarcode) {
      alert('Hata: Aktif raf veya taranmış ürün barkodu bulunamadı!');
      return;
    }

    setIsLoading(true);
    try {
      const numericQuantity = parseInt(miktar) || 1;

      // Backend'deki yeni processScan metoduna verileri gönderiyoruz
      const response = await inventoryApi.scanBarcode(
        lastScannedProductBarcode, // Ham ürün barkodu (Örn: 869...)
        numericQuantity,           // Girilen adet
        currentLoc.konumKodu       // Ham konum kodu (Örn: DP1-A-...)
      );
      
      // Zustand global listesine ekle
      addScannedItem({
        sku: response?.sku || dbProductInfo?.sku || lastScannedProductBarcode,
        yeniStok: response?.raftakiYeniStok || numericQuantity,
        miktar: numericQuantity,
        konumKodu: currentLoc.konumKodu,
        barkod: lastScannedProductBarcode
      });

      // Başarılı işlem sonrası formu ve hafızayı temizleme
      setMiktar('1');
      setLastScannedProductBarcode('');
      setDbProductInfo(null);
      setActiveTab('scan'); // Tarama ekranına temiz dönüş yap
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
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-bold font-mono bg-zinc-900 px-2.5 py-1 rounded-l-lg border border-zinc-800 text-emerald-400 border-r-0">
                Raf: {activeLocation.konumKodu}
              </span>
              <span className="text-[12px] font-bold font-mono bg-zinc-800 px-2 py-1 rounded-r-lg border border-zinc-700 text-amber-400">
                {(activeLocation as any).checkDigit || '0'}
              </span>
            </div>
          ) : (
            <span className="text-[12px] font-bold font-mono bg-zinc-900/50 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-500 animate-pulse">
              Konum Okutun
            </span>
          )}
        </div>

        <TabMenu 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          disabledTabs={!activeLocation ? ['detail', 'quantity'] : []} 
        />

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoading && <div className="text-center text-xs text-zinc-500 font-mono py-2 animate-pulse">Veritabanı senkronizasyonu...</div>}

          {activeTab === 'scan' && (
            <div className="space-y-4">
              <BarcodeScanner onResult={handleBarcodeResult} />
              <ScanHistoryList items={scannedItems} />
            </div>
          )}

          {activeTab === 'detail' && (
            <ProductDetailCard 
              // DÜZELTME: Veritabanındaki gerçek eşleşen ürün ismi karta basılıyor
              urunAdi={dbProductInfo?.urunAdi || "Taranan Ürün Detayı Yükleniyor..."} 
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
