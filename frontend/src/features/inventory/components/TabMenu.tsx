'use client';

import React from 'react';

export type TabType = 'scan' | 'detail' | 'quantity';

interface TabMenuProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function TabMenu({ activeTab, setActiveTab }: TabMenuProps) {
  return (
    // Arka plan rengi görseldeki gibi tam siyah tonuna [#121212] çekildi.
    // Sadece alt kenarlık (border-b) eklenerek ayrım sağlandı.
    <div className="w-full bg-[#121212] border-b border-[#262626] shrink-0">
      <div className="flex justify-around items-center h-12 max-w-md mx-auto px-2">
        
        {/* Barkod Tara Sekmesi */}
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`flex-1 text-center py-3 text-[13px] font-bold tracking-wide transition-all relative ${
            activeTab === 'scan' ? 'text-white' : 'text-gray-400'
          }`}
        >
          Barkod Tara
          {activeTab === 'scan' && (
            // Görseldeki gibi sade, gölgesiz ve net beyaz alt çizgi
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
          )}
        </button>

        {/* Ürün Detayı Sekmesi */}
        <button
          type="button"
          onClick={() => setActiveTab('detail')}
          className={`flex-1 text-center py-3 text-[13px] font-bold tracking-wide transition-all relative ${
            activeTab === 'detail' ? 'text-white' : 'text-gray-400'
          }`}
        >
          Ürün Detayı
          {activeTab === 'detail' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
          )}
        </button>

        {/* Adet Giriniz Sekmesi */}
        <button
          type="button"
          onClick={() => setActiveTab('quantity')}
          className={`flex-1 text-center py-3 text-[13px] font-bold tracking-wide transition-all relative ${
            activeTab === 'quantity' ? 'text-white' : 'text-gray-400'
          }`}
        >
          Adet Giriniz
          {activeTab === 'quantity' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
          )}
        </button>
        
      </div>
    </div>
  );
}
