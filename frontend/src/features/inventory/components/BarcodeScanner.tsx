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
          0% { top: 15%; }
          50% { top: 85%; }
          100% { top: 15%; }
        }
      `}</style>

      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '1.4', 
        background: '#000', 
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <video 
          ref={videoRef} 
          playsInline 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />

        {/* KÖŞE ÇERÇEVELERİ */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '4px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderTop: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 4px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderBottom: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '0 0 0 4px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 0 4px 0' }} />

        {/* HAREKETLİ LAZER */}
        {scanning && !processing && (
          <div style={{ 
            position: 'absolute', 
            left: '10%', 
            right: '10%', 
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
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            backdropFilter: 'blur(4px)', zIndex: 20 
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500', letterSpacing: '2px' }}>İŞLENİYOR</span>
              <div style={{ width: '40px', height: '2px', background: '#ff0000' }}></div>
            </div>
          </div>
        )}

        {/* KAMERA BUTONU (Küçültüldü ve Kenarlardan Uzaklaştırıldı) */}
        {!processing && (
          <button
            onClick={scanning ? stop : start}
            style={{
              position: 'absolute', 
              top: '20px', // Aşağı kaydırıldı (15px -> 20px)
              right: '20px', // Sola kaydırıldı (15px -> 20px)
              width: '36px', // Hafif küçültüldü (40px -> 36px)
              height: '36px', 
              borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.75)', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              zIndex: 30, 
              transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="black"> {/* İkon küçültüldü (24 -> 18) */}
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
