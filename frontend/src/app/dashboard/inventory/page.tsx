'use client';

import React, { useState } from 'react';
import styles from './inventory.module.css'; // 1. Yöntem: Harici Stil Dosyası
import ProductDetailCard from '@/components/inventory/ProductDetailCard'; // 2. Yöntem: Alt Bileşen
import QuantityInputCard from '@/components/inventory/QuantityInputCard';

export default function InventoryPage() {
  const [miktar, setMiktar] = useState<string>('45');

  const handleOnayla = () => {
    alert(`Stok Sayım Fişi Oluşturuluyor: Girilen Miktar ${miktar}`);
    // Backend API fetch/axios istekleri buraya eklenecek
  };

  return (
    <div className={styles.pageContainer}>
      <div>
        {/* Üst Başlık Barı (Aynı Kalıyor) */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-[#1a1a1a]">
          <h1 className="text-[17px] font-normal tracking-wide">Mobil Stok Sayım</h1>
          <span className="text-[14px] font-normal text-zinc-300">Depo: A</span>
        </div>

        {/* Barkod Alanı Simülasyonu (Aynı Kalıyor) */}
        <div className="px-4 py-3 text-[14px] text-zinc-400">Sayım Ekranı</div>

        {/* ─── MODÜLER ALANLAR ─── */}
        <div className="px-4 space-y-3">
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
