'use client';

import React from 'react';

// Sekme seçeneklerini tip güvenliği için sabitliyoruz
export type TabType = 'scan' | 'detail' | 'quantity';

interface TabMenuProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function TabMenu({ activeTab, setActiveTab }: TabMenuProps) {
  return (
    <div className="w-full bg-[#1e293b] border-b border-slate-700/50">
      <div className="flex justify-around items-center h-12 px-2">
        
        {/* 1. Barkod Tara Sekmesi */}
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 text-center py-3 text-sm font-bold transition-all relative ${
            activeTab === 'scan' ? 'text-white' : 'text-slate-400'
          }`}
        >
          Barkod Tara
          {activeTab === 'scan' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-white rounded-t-full" />
          )}
        </button>

        {/* 2. Ürün Detayı Sekmesi */}
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex-1 text-center py-3 text-sm font-bold transition-all relative ${
            activeTab === 'detail' ? 'text-white' : 'text-slate-400'
          }`}
        >
          Ürün Detayı
          {activeTab === 'detail' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-white rounded-t-full" />
          )}
        </button>

        {/* 3. Adet Giriniz Sekmesi */}
        <button
          onClick={() => setActiveTab('quantity')}
          className={`flex-1 text-center py-3 text-sm font-bold transition-all relative ${
            activeTab === 'quantity' ? 'text-white' : 'text-slate-400'
          }`}
        >
          Adet Giriniz
          {activeTab === 'quantity' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-white rounded-t-full" />
          )}
        </button>

      </div>
    </div>
  );
}

