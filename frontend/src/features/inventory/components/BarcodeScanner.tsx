'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function BarcodeScanner({ onResult }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<any>(null); // Kütüphaneyi burada saklayacağız
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // KÜTÜPHANEYİ NASIL KULLANMALIYIZ?
    // Doğrudan 'import' yerine 'dynamic import' kullanarak build hatasını engelliyoruz.
    const loadScanner = async () => {
      const { BrowserMultiFormatReader } = await import('@zxing/library');
      readerRef.current = new BrowserMultiFormatReader();
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

      // Kamerayı başlat ve oku
      await readerRef.current.decodeFromVideoDevice(
        undefined, // Varsayılan arka kamerayı seçer
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
      setScanning(false);
    }
  };

  const stop = () => {
    if (readerRef.current) readerRef.current.reset();
    setScanning(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '1.4', 
        background: '#000', 
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.15)',
        overflow: 'hidden'
      }}>
        {/* KAMERA ALANI */}
        <video ref={videoRef} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* PRO ÇERÇEVE (Kenarlardan 1mm içeride) */}
        <div style={{ position: 'absolute', top: '2px', left: '2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', top: '2px', right: '2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderRight: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: '2px', left: '2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }} />

        {/* BLUR LAZER ÇİZGİSİ */}
        {scanning && !processing && (
          <div style={{ 
            position: 'absolute', top: '50%', left: '12%', right: '12%', height: '2px', 
            background: 'rgba(255, 0, 0, 0.4)', boxShadow: '0 0 10px 2px red' 
          }} />
        )}

        {/* ŞEFFAF İŞLENİYOR EKRANI */}
        {processing && (
          <div style={{ 
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' 
          }}>
            <span style={{ color: '#fff', fontSize: '14px', letterSpacing: '1px' }}>İŞLENİYOR...</span>
          </div>
        )}

        {/* 4 NOLU ALAN: BEYAZ ŞEFFAF DAİRE + SİYAH KAMERA İKONU */}
        {!processing && (
          <button
            onClick={scanning ? stop : start}
            style={{
              position: 'absolute', top: '15px', right: '15px', width: '38px', height: '38px', 
              borderRadius: '50%', background: 'rgba(255, 255, 255, 0.7)', border: 'none', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="black">
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
