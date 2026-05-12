'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function BarkodScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [scanning, setScanning] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    BrowserMultiFormatReader.listVideoInputDevices().then((devices) => {
      const back = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('arka'));
      setDeviceId(back?.deviceId || devices[0]?.deviceId || '');
    });
    return () => stop();
  }, []);

  const start = async () => {
    if (!deviceId || !videoRef.current) return;
    try {
      setScanning(true);
      // decodeFromVideoDevice hem kamerayı açar hem taramaya başlar
      const controls = await readerRef.current!.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            if (navigator.vibrate) navigator.vibrate(100);
            onResult(result.getText());
          }
        }
      );
      controlsRef.current = controls;
    } catch (e) {
      setScanning(false);
    }
  };

  const stop = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', overflow: 'hidden' }}>
      
      {/* 1 NOLU ALAN: RESİMDEKİ GİBİ ÇERÇEVE VE KAMERA ALANI */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '1.5', // Taşmayı önlemek için sabit oran
        background: '#000', 
        borderRadius: '12px',
        border: '2px solid rgba(255,255,255,0.2)',
        overflow: 'hidden'
      }}>
        
        <video 
          ref={videoRef} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />

        {/* BARKOD KÖŞE ÇİZGİLERİ */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '25px', height: '25px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '25px', height: '25px', borderTop: '4px solid #fff', borderRight: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '25px', height: '25px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '25px', height: '25px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }} />

        {/* MERKEZİ KIRMIZI LAZER */}
        {scanning && (
          <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: 'red', boxShadow: '0 0 10px red', zIndex: 5 }} />
        )}

        {/* 4 NOLU ALAN: BEYAZ DAİRE + SİYAH KAMERA İKONU (YAZISIZ) */}
        <button
          onClick={scanning ? stop : start}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.75)', // Şeffaf beyaz
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          {/* Fotoğraf Makinesi İkonu (SVG - Kütüphane gerektirmez) */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="black">
            <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
