'use client';

import React from 'react';

// Yeni akışa uygun sekme tipleri
export type TabType = 'scan' | 'detail' | 'quantity';

interface TabMenuProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  disabledTabs?: TabType[]; // YENİ: Akış sırası bozulmasın diye kilitlenebilir sekmeler
}

export default function TabMenu({ activeTab, setActiveTab, disabledTabs = [] }: TabMenuProps) {
  
  const handleTabClick = (tab: TabType) => {
    // Eğer sekme kilitliyse tıklanmasını engelle
    if (disabledTabs.includes(tab)) return;
    setActiveTab(tab);
  };

  return (
    <div className="w-full bg-[#121212] border-b border-[#262626] shrink-0">
      <div className="flex justify-around items-center h-12 max-w-md mx-auto px-2">
        
        {/* 1. SEKMELER: Barkod Tara (Raf ve Ürün Giriş Alanı) */}
        <button
          type="button"
          onClick={() => handleTabClick('scan')}
          disabled={disabledTabs.includes('scan')}
          className={`flex-1 text-center py-3 text-[13px] font-bold tracking-wide transition-all relative ${
            activeTab === 'scan' ? 'text-white' : 'text-zinc-500'
          } ${disabledTabs.includes('scan') ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Barkod Tara
          {activeTab === 'scan' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
          )}
        </button>

        {/* 2. SEKMELER: Ürün Detayı (Okutulan Ürünün Bilgileri) */}
        <button
          type="button"
          onClick={() => handleTabClick('detail')}
          disabled={disabledTabs.includes('detail')}
          className={`flex-1 text-center py-3 text-[13px] font-bold tracking-wide transition-all relative ${
            activeTab === 'detail' ? 'text-white' : 'text-zinc-500'
          } ${disabledTabs.includes('detail') ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Ürün Detayı
          {activeTab === 'detail' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
          )}
        </button>

        {/* 3. SEKMELER: Miktar Girişi (Onaylama Adımı) */}
        <button
          type="button"
          onClick={() => handleTabClick('quantity')}
          disabled={disabledTabs.includes('quantity')}
          className={`flex-1 text-center py-3 text-[13px] font-bold tracking-wide transition-all relative ${
            activeTab === 'quantity' ? 'text-white' : 'text-zinc-500'
          } ${disabledTabs.includes('quantity') ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Miktar Gir
          {activeTab === 'quantity' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
          )}
        </button>
        
      </div>
    </div>
  );
}
