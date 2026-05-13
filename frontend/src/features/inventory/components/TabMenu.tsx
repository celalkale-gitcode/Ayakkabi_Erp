'use client';

import React from 'react';

export type TabType = 'scan' | 'detail' | 'quantity';

interface TabMenuProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function TabMenu({ activeTab, setActiveTab }: TabMenuProps) {
  return (
    <div className="w-full bg-[#1a1a1a] border-y border-[#2d2d2d] shrink-0">
      <div className="flex justify-around items-center h-11 max-w-md mx-auto">
        {/* Barkod Tara */}
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`flex-1 text-center py-2.5 text-xs font-black tracking-wider uppercase transition-all relative ${
            activeTab === 'scan' ? 'text-white' : 'text-gray-500'
          }`}
        >
          Barkod Tara
          {activeTab === 'scan' && (
            <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white rounded-t-full shadow-[0_-2px_6px_rgba(255,255,255,0.4)]" />
          )}
        </button>

        {/* Ürün Detayı */}
        <button
          type="button"
          onClick={() => setActiveTab('detail')}
          className={`flex-1 text-center py-2.5 text-xs font-black tracking-wider uppercase transition-all relative ${
            activeTab === 'detail' ? 'text-white' : 'text-gray-500'
          }`}
        >
          Ürün Detayı
          {activeTab === 'detail' && (
            <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white rounded-t-full shadow-[0_-2px_6px_rgba(255,255,255,0.4)]" />
          )}
        </button>

        {/* Adet Giriniz */}
        <button
          type="button"
          onClick={() => setActiveTab('quantity')}
          className={`flex-1 text-center py-3.5 text-xs font-black tracking-wider uppercase transition-all relative ${
            activeTab === 'quantity' ? 'text-white' : 'text-slate-400'
          }`}
        >
          Adet Giriniz
          {activeTab === 'quantity' && (
            <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white rounded-t-full shadow-[0_-2px_6px_rgba(255,255,255,0.4)]" />
          )}
        </button>
      </div>
    </div>
  );
}
