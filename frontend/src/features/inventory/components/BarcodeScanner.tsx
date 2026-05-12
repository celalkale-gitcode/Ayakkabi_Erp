'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function BarkodScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    BrowserMultiFormatReader.listVideoInputDevices().then((d) => {
      const back = d.find(i => i.label.toLowerCase().includes('back') || i.label.toLowerCase().includes('arka'));
      setDeviceId(back?.deviceId || d[0]?.deviceId || '');
    });
    return () => stop();
  }, []);

  const start = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId ? { exact: deviceId } : undefined, facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      readerRef.current?.decodeFromStream(stream, videoRef.current!, (res) => {
        if (res) {
          if (navigator.vibrate) navigator.vibrate(100);
          onResult(res.getText().trim());
        }
      });
    } catch (e) { setScanning(false); }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto', background: '#000', padding: '15px' }}>
      
      {/* 1 NOLU ALAN: KAMERA VE ÇERÇEVE BİRLEŞİK */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '220px', // Resimdeki gibi yatay dikdörtgen form
        border: '2px solid rgba(255,255,255,0.3)', 
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        
        {/* KAMERA GÖRÜNTÜSÜ */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />

        {/* BARKOD KÖŞELERİ */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '20px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '20px', height: '20px', borderTop: '4px solid #fff', borderRight: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '20px', height: '20px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }} />

        {/* KIRMIZI LAZER ÇİZGİSİ */}
        {scanning && (
          <div style={{ position: 'absolute', top: '50%', left: '5%', right: '5%', height: '2px', background: 'red', boxShadow: '0 0 8px red' }} />
        )}

        {/* 4 NOLU ALAN: ŞEFFAF BEYAZ DAİRE + SİYAH KAMERA İKONU */}
        <button
          onClick={scanning ? stop : start}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.7)', // Şeffaf beyaz
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
            <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
        </button>
      </div>

      <style>{`
        body { background-color: #000; }
      `}</style>
    </div>
  );
}
