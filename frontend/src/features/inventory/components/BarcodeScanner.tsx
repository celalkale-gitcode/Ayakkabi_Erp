'use client';

import React, { useEffect, useRef, useState } from 'react';
import CameraButton from './CameraButton';

export default function BarcodeScanner({ onResult }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/library');
        // Karmaşık "hints" ayarlarını kaldırıp varsayılan hızda başlatıyoruz
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

      // Çözünürlüğü ideal seviyeye çekerek işlemciyi rahatlatıyoruz
      const constraints = {
        video: { 
          facingMode: "environment",
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        }
      };

      await readerRef.current.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result: any) => {
          if (result && !processing) {
            const text = result.getText();
            
            // Okuma gerçekleştiği an:
            setProcessing(true); // 1. Ekranı kilitle
            if (navigator.vibrate) navigator.vibrate(100);
            
            // 2. Kamerayı hemen durdur (Takılmayı önlemek için kritik)
            if (readerRef.current) readerRef.current.reset();
            setScanning(false);

            // 3. Sonucu gönder
            onResult(text);

            // 4. 2 saniye sonra sistemi boşa çıkar
            setTimeout(() => {
              setProcessing(false);
            }, 2000);
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
        @keyframes scanMove { 0% { top: 20%; } 50% { top: 80%; } 100% { top: 20%; } }
      `}</style>

      <div style={{ 
        position: 'relative', width: '100%', aspectRatio: '1.8', background: '#000', 
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden'
      }}>
        <video ref={videoRef} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* Köşe Çizgileri */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', width: '20px', height: '20px', borderTop: '3px solid rgba(255,255,255,0.4)', borderLeft: '3px solid rgba(255,255,255,0.4)', borderRadius: '4px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '20px', height: '20px', borderTop: '3px solid rgba(255,255,255,0.4)', borderRight: '3px solid rgba(255,255,255,0.4)', borderRadius: '0 4px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '20px', height: '20px', borderBottom: '3px solid rgba(255,255,255,0.4)', borderLeft: '3px solid rgba(255,255,255,0.4)', borderRadius: '0 0 0 4px' }} />
        <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '20px', height: '20px', borderBottom: '3px solid rgba(255,255,255,0.4)', borderRight: '3px solid rgba(255,255,255,0.4)', borderRadius: '0 0 4px 0' }} />

        {/* Lazer */}
        {scanning && !processing && (
          <div style={{ 
            position: 'absolute', left: '12%', right: '12%', height: '1.5px', background: 'rgba(255, 0, 0, 0.4)',
            boxShadow: '0 0 10px 1px rgba(255, 0, 0, 0.4)', zIndex: 10, animation: 'scanMove 3s ease-in-out infinite' 
          }} />
        )}

        {/* İşleniyor Ekranı */}
        {processing && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600', letterSpacing: '2px' }}>İŞLENİYOR</span>
              <div style={{ width: '30px', height: '2px', background: '#ff0000' }}></div>
            </div>
          </div>
        )}

        {!processing && <CameraButton scanning={scanning} start={start} stop={stop} />}
      </div>
    </div>
  );
}
