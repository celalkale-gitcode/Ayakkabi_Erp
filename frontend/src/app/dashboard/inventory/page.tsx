'use client';

import React, { useState } from 'react';
import styles from './inventory.module.css'; 
import ProductDetailCard from '@/features/inventory/components/ProductDetailCard'; 
import QuantityInputCard from '@/features/inventory/components/QuantityInputCard';
import BarcodeScanner from '@/features/inventory/components/BarcodeScanner';

export default function InventoryPage() {
  const [miktar, setMiktar] = useState<string>('45');
  const [scannedSku, setScannedSku] = useState<string>('STK-45678'); // Resimdeki varsayılan SKU

  const handleBarcodeResult = (barcode: string) => {
    console.log("Okunan Barkod:", barcode);
    setScannedSku(barcode);
    // Barkod okunduğunda backend entegrasyonu veya ürün getirme mantığı buraya gelecek
  };

  const handleOnayla = () => {
    alert(`Stok Sayım Fişi Oluşturuluyor: Girilen Miktar ${miktar} (SKU: ${scannedSku})`);
  };

  return (
    <div className={styles.pageContainer}>
      <div className="bg-[#121212] min-h-screen text-white">
        {/* Üst Başlık Barı */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            {/* Resimdeki sol menü ikonu simülasyonu */}
            <div className="flex flex-col gap-[4px] w-5 cursor-pointer">
              <span className="h-[2px] bg-white w-full"></span>
              <span className="h-[2px] bg-white w-full"></span>
              <span className="h-[2px] bg-white w-full"></span>
            </div>
            <h1 className="text-[17px] font-normal tracking-wide">Mobil Stok Sayım</h1>
          </div>
          <span className="text-[14px] font-normal text-zinc-300">Depo: A</span>
        </div>

        {/* Sayım Ekranı Başlığı */}
        <div className="px-4 py-3 text-[14px] text-zinc-400">Sayım Ekranı</div>

        {/* Canlı Barkod Tarayıcı Alanı */}
        <div className="px-4 mb-3">
          <BarcodeScanner onResult={handleBarcodeResult} />
        </div>

        {/* Resimdeki Sekme/Buton Etiketleri */}
        <div className="flex justify-between px-6 py-2 text-[12px] font-medium text-zinc-400">
          <span>Barkod Tara</span>
          <span>Ürün Detayı</span>
          <span>Adet Giriniz</span>
        </div>

        {/* ─── MODÜLER ALANLAR ─── */}
        <div className="px-4 space-y-3 mt-1">
          {/* 1 NOLU ALAN: Ürün kartı modülü */}
          <ProductDetailCard 
            urunAdi="LED PANEL - 24W (PHILIPS)" 
            lokasyon="A-12-04" 
            raf="03" 
          />

          {/* 2 NOLU ALAN: Giriş ve işlem modülü */}
          <QuantityInputCard 
            mevcutStok={42} 
            miktar={miktar} 
            setMiktar={setMiktar} 
            onOnayla={handleOnayla} 
          />
        </div>
      </div>
    </div>
  );
}
