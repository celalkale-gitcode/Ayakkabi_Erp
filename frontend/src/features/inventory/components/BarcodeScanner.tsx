'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function BarcodeScanner({ onResult }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/library');
        readerRef.current = new BrowserMultiFormatReader();
      } catch (err) {
        console.error("Scanner yüklenemedi:", err);
      }
    };
    loadScanner();

    return () => {
      if (readerRef.current) readerRef.current.reset();
    };
  }, []);

  const start = async () => {
    if (!videoRef.current || !readerRef.current) return;
    try {
      setScanning(true);
      setProcessing(false);

      await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result: any) => {
          if (result && !processing) {
            setProcessing(true);
            if (navigator.vibrate) navigator.vibrate(100);
            onResult(result.getText());
            setTimeout(() => setProcessing(false), 2000);
          }
        }
      );
    } catch (err) {
      console.error("Kamera başlatılamadı:", err);
      setScanning(false);
    }
  };

  const stop = () => {
    if (readerRef.current) readerRef.current.reset();
    setScanning(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <style>{`
        @keyframes scanMove {
          0% { top: 20%; }
          50% { top: 80%; }
          100% { top: 20%; }
        }
      `}</style>

      {/* ANA ÇERÇEVE: BLUR VE GÖLGE KALDIRILDI, KESKİNLEŞTİRİLDİ */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '1.8', 
        background: '#000', 
        borderRadius: '12px', // Hafif kavis korundu, istersen 0 yapıp tam kare yapabilirsin
        border: '1px solid rgba(255,255,255,0.3)', // Çizgi biraz daha netleştirildi
        overflow: 'hidden',
        boxShadow: 'none' // TÜM GÖLGE VE BLUR EFEKTİ KALDIRILDI
      }}>
        <video 
          ref={videoRef} 
          playsInline 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />

        {/* KÖŞE ÇERÇEVELERİ */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', width: '20px', height: '20px', borderTop: '3px solid rgba(255,255,255,0.4)', borderLeft: '3px solid rgba(255,255,255,0.4)', borderRadius: '4px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '20px', height: '20px', borderTop: '3px solid rgba(255,255,255,0.4)', borderRight: '3px solid rgba(255,255,255,0.4)', borderRadius: '0 4px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '20px', height: '20px', borderBottom: '3px solid rgba(255,255,255,0.4)', borderLeft: '3px solid rgba(255,255,255,0.4)', borderRadius: '0 0 0 4px' }} />
        <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '20px', height: '20px', borderBottom: '3px solid rgba(255,255,255,0.4)', borderRight: '3px solid rgba(255,255,255,0.4)', borderRadius: '0 0 4px 0' }} />

        {/* LAZER */}
        {scanning && !processing && (
          <div style={{ 
            position: 'absolute', 
            left: '12%', 
            right: '12%', 
            height: '1.5px',
            background: 'rgba(255, 0, 0, 0.4)',
            boxShadow: '0 0 10px 1px rgba(255, 0, 0, 0.4), 0 0 4px 0px rgba(255, 255, 255, 0.2)',
            zIndex: 10,
            animation: 'scanMove 3s ease-in-out infinite'
          }} />
        )}

        {/* İŞLENİYOR EKRANI */}
        {processing && (
          <div style={{ 
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', // Biraz daha koyulaştırıldı
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            zIndex: 20 
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600', letterSpacing: '2px' }}>İŞLENİYOR</span>
              <div style={{ width: '30px', height: '2px', background: '#ff0000' }}></div>
            </div>
          </div>
        )}

  {/* KAMERA BUTONU */}
        {!processing && (
           <button
  onClick={scanning ? stop : start}
  style={{
    // Mevcut kodlarınız...
    position: 'absolute',
    top: '24px',
    right: '24px',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    
    // ÇÖZÜM İÇİN BURASI KRİTİK:
    outline: '0',
    outlineOffset: '0',
    WebkitTapHighlightColor: 'transparent',
    WebkitAppearance: 'none',
    boxShadow: 'none',
    
    // Bazı tarayıcılar için "touch" olayını optimize edin
    touchAction: 'manipulation' 
  }}
>

            <svg width="16" height="16" viewBox="0 0 24 24" fill={scanning ? '#fff' : 'rgba(0, 0, 0, 0.7)'}>
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
