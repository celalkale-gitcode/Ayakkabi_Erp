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
  
  // YENİ: Terminal tarafından en son okutulan ÜRÜN barkodunu hafızada tutar
  const [lastScannedProductBarcode, setLastScannedProductBarcode] = useState<string>('');

  const { 
    scannedItems, 
    activeLocation, 
    addScannedItem,
    setActiveLocation 
  } = useInventoryStore();

  // Barkod Okunduğunda Çalışan Ana Fonksiyon
  const handleBarcodeResult = async (barcode: string) => {
    const cleanBarcode = barcode.trim().toUpperCase();

    // 1. ADIM: Eğer henüz raf konumu seçilmediyse, okutulan ilk barkodu RAF BARKODU kabul et
    if (!activeLocation) {
      setIsLoading(true);
      try {
        // Not: Gerçek senaryoda burası api.getSuggestedLocation(cleanBarcode) ile beslenebilir.
        setActiveLocation({
          id: 'konum_active_id', 
          konumKodu: cleanBarcode.includes('DP1') ? cleanBarcode : 'DP1-A-R12-03-02-010',
          tanimliBeden: '42',
          isFull: false,
          checkDigit: '5' 
        });
        
        setActiveTab('scan');
      } catch (err) {
        console.error('Raf konumu çözümlenirken hata oluştu:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. ADIM: Raf zaten seçiliyse, bu okutulan barkod bir ÜRÜN BARKODUDUR.
    setLastScannedProductBarcode(cleanBarcode); // Okunan barkodu kaydet
    setActiveTab('quantity'); // Miktar giriş ekranını aç
  };

  // Miktar onaylandığında veritabanına kaydeden fonksiyon
  const handleOnayla = async () => {
    if (!activeLocation || !lastScannedProductBarcode) {
      alert('Hata: Aktif raf veya taranmış ürün barkodu bulunamadı!');
      return;
    }

    setIsLoading(true);
    try {
      const numericQuantity = parseInt(miktar) || 1;

      // KRİTİK DÜZELTME: Mock veri yerine taranan gerçek barkod ve aktif konum backend'e gönderiliyor
      const response = await inventoryApi.scanBarcode(
        lastScannedProductBarcode, // Gerçek Ürün Barkodu
        numericQuantity,           // Girilen Adet
        activeLocation.id          // Aktif Rafın ID'si
      );
      
      // Zustand global state listesine ekle (Arayüzde anlık listelenmesi için)
      addScannedItem({
        sku: response?.sku || lastScannedProductBarcode, // Backend'den dönen SKU yoksa barkodu bas
        yeniStok: response?.yeniStok || numericQuantity,
        miktar: numericQuantity,
        konumKodu: activeLocation.konumKodu,
        barkod: lastScannedProductBarcode
      });

      // Temizlik ve Reset adımları
      setMiktar('1');
      setLastScannedProductBarcode(''); // Ürün barkodunu sıfırla (Yeni ürün için)
      setActiveTab('scan'); // Tarama ekranına geri dön
    } catch (error: any) {
      console.error('Veritabanı kayıt hatası:', error);
      alert(error?.message || 'Ürün veritabanına işlenirken bir hata oluştu.');
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
              urunAdi="KLASİK DERİ KUNDURA - KALE" 
              lokasyon={activeLocation?.konumKodu || '-'} 
              raf={activeLocation?.konumKodu.split('-').pop() || '-'} 
            />
          )}

          {activeTab === 'quantity' && (
            <QuantityInputCard 
              mevcutStok={activeLocation ? 12 : 0} 
              miktar={miktar} 
              setMiktar={setMiktar} 
              onOnayla={handleOnayla} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
