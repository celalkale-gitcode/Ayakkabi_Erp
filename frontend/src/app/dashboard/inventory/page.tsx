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

  const { 
    scannedItems, 
    activeLocation, 
    addScannedItem,
    setActiveLocation 
  } = useInventoryStore();

  const handleBarcodeResult = async (barcode: string) => {
    if (!activeLocation) {
      setIsLoading(true);
      try {
        setActiveLocation({
          id: 'konum-123',
          konumKodu: barcode,
          tanimliBeden: '42',
          isFull: false
        });
        setActiveTab('scan');
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setActiveTab('quantity');
  };

  const handleOnayla = async () => {
    if (!activeLocation) return;
    setIsLoading(true);
    try {
      const numericQuantity = parseInt(miktar) || 1;
      const mockSku = 'KND-102-SIYAH-42'; 
      const response = await inventoryApi.scanBarcode(mockSku, numericQuantity, activeLocation.id);
      
      addScannedItem({
        sku: mockSku,
        yeniStok: response?.yeniStok || 50,
        miktar: numericQuantity,
        konumKodu: activeLocation.konumKodu
      });

      setMiktar('1');
      setActiveTab('scan');
    } catch (error: any) {
      alert(error?.message || 'Hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className="bg-[#121212] min-h-screen text-white flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-[#1a1a1a] border-b border-zinc-800/40">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-bold tracking-wider uppercase text-zinc-200">Mobil Stok Operasyonu</h1>
          </div>
          <span className="text-[12px] font-bold font-mono bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-emerald-400">
            {activeLocation ? `Raf: ${activeLocation.konumKodu}` : 'Raf Seçilmedi'}
          </span>
        </div>

        <TabMenu 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          disabledTabs={!activeLocation ? ['detail', 'quantity'] : []} 
        />

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoading && <div className="text-center text-xs text-zinc-500 font-mono py-2">İşlem yapılıyor...</div>}

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
