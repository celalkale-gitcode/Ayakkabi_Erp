'use client';

import React, { useState } from 'react';

export default function InventoryPage() {
  const [miktar, setMiktar] = useState<string>('45');

  return (
    <div 
      className="min-h-screen bg-[#000000] text-[#ffffff] font-sans"
      style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '30px' }}
    >
      {/* Üst Başlık Barı */}
      <div 
        className="flex items-center justify-between px-4 pt-4 pb-3 bg-[#1a1a1a]"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px 16px', backgroundColor: '#1a1a1a' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'pointer' }}>
            <div style={{ width: '20px', height: '2px', backgroundColor: '#ffffff' }}></div>
            <div style={{ width: '20px', height: '2px', backgroundColor: '#ffffff' }}></div>
            <div style={{ width: '20px', height: '2px', backgroundColor: '#ffffff' }}></div>
          </div>
          <h1 style={{ fontSize: '17px', margin: 0, fontWeight: 'normal' }}>Mobil Stok Sayım</h1>
        </div>
        <span style={{ fontSize: '14px', color: '#d4d4d8' }}>Depo: A</span>
      </div>

      {/* Alt Başlık */}
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0 }}>Sayım Ekranı</p>
      </div>

      {/* Kamera / Barkod Tarama Bölümü */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div style={{ width: '100%', backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #27272a', padding: '16px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '85%', backgroundColor: '#e4e4e7', padding: '16px', borderRadius: '4px', color: '#000000', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '14px' }}>📷</div>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', color: '#3f3f46', marginBottom: '4px' }}>SKU: STK-45678</span>
            <div style={{ width: '100%', height: '56px', backgroundColor: '#d4d4d8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '4px 0' }}>
              <span style={{ fontSize: '24px', letterSpacing: '2px', fontFamily: 'serif' }}>||||| | |||| ||| ||</span>
              <div style={{ position: 'absolute', width: '100%', height: '2px', backgroundColor: '#dc2626', top: '50%', left: 0 }}></div>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1px', color: '#52525b' }}>8 027475 45678</span>
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '12px', fontWeight: 'bold' }}>[ ]</div>
          </div>
        </div>
      </div>

      {/* Menü Sekmeleri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', borderBottom: '1px solid #18181b', fontSize: '13px', color: '#a1a1aa', padding: '0 8px', marginBottom: '16px' }}>
        <button style={{ paddingBottom: '10px', background: 'none', border: 'none', color: '#a1a1aa', textAlign: 'center' }}>Barkod Tara</button>
        <button style={{ paddingBottom: '10px', background: 'none', border: 'none', color: '#e4e4e7', borderBottom: '2px solid #a1a1aa', fontWeight: 'bold', textAlign: 'center' }}>Ürün Detayı</button>
        <button style={{ paddingBottom: '10px', background: 'none', border: 'none', color: '#a1a1aa', textAlign: 'center' }}>Adet Giriniz</button>
      </div>

      {/* İçerik Alanı Kapsayıcısı */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* ─── 1 NOLU ALAN: ÜRÜN DETAY KUTUSU ─── */}
        <div style={{ backgroundColor: '#1c1c1e', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>ÜRÜN ADI: <span style={{ color: '#d4d4d8', fontWeight: 'normal' }}>LED PANEL - 24W (PHILIPS)</span></div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>Lokasyon: <span style={{ color: '#d4d4d8', fontWeight: 'normal' }}>A-12-04</span></div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>Raf: <span style={{ color: '#d4d4d8', fontWeight: 'normal' }}>03</span></div>
        </div>

        {/* ─── 2 NOLU ALAN: MİKTAR GİRİŞ VE AKSİYON KUTUSU ─── */}
        <div style={{ backgroundColor: '#1c1c1e', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>Mevcut: <span style={{ color: '#d4d4d8', fontWeight: 'normal' }}>42 Adet</span></div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', whiteSpace: 'nowrap' }}>Miktar Girin:</label>
            <input
              type="number"
              value={miktar}
              onChange={(e) => setMiktar(e.target.value)}
              style={{ width: '100%', backgroundColor: '#121214', border: '1px solid #065f46', borderRadius: '8px', padding: '10px 16px', fontSize: '16px', color: '#ffffff', outline: 'none', fontFamily: 'monospace' }}
            />
          </div>

          {/* Değişim Butonları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
            <button onClick={() => setMiktar((prev) => (parseInt(prev) || 0) + 1 + '')} style={{ backgroundColor: '#2c2c2e', color: '#e4e4e7', padding: '12px 0', borderRadius: '8px', border: '1px solid #3a3a3c', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>+1</button>
            <button onClick={() => setMiktar((prev) => (parseInt(prev) || 0) + 10 + '')} style={{ backgroundColor: '#2c2c2e', color: '#e4e4e7', padding: '12px 0', borderRadius: '8px', border: '1px solid #3a3a3c', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>+10</button>
            <button onClick={() => setMiktar('')} style={{ backgroundColor: '#2c2c2e', color: '#e4e4e7', padding: '12px 0', borderRadius: '8px', border: '1px solid #3a3a3c', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Sil</button>
          </div>

          {/* ONAYLA Butonu */}
          <button style={{ width: '100%', backgroundColor: '#2ca86b', color: '#ffffff', border: 'none', padding: '14px 0', borderRadius: '12px', fontWeight: '500', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', marginTop: '8px' }}>
            ONAYLA
          </button>
        </div>

      </div>
    </div>
  );
}
