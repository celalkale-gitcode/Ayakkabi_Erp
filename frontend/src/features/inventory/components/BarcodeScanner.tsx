'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function BarkodScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const lock = useRef(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((d) => {
        const backCam = d.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('arka')
        );
        setDeviceId(backCam?.deviceId || d[0]?.deviceId || '');
      });
    return () => stop();
  }, []);

  const start = async () => {
    try {
      if (!videoRef.current || !readerRef.current) return;
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId ? { exact: deviceId } : undefined, facingMode: 'environment' }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      readerRef.current.decodeFromStream(stream, videoRef.current, (res) => {
        if (!res || lock.current) return;
        const code = res.getText().trim();
        lock.current = true;
        setProcessing(true);
        if (navigator.vibrate) navigator.vibrate(100);
        onResult(code);
        setTimeout(() => { setProcessing(false); lock.current = false; }, 2000);
      });
    } catch (e) { setScanning(false); }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', background: '#111', borderRadius: '16px', overflow: 'hidden', padding: '10px' }}>
      
      {/* 1 NOLU ALAN: KAMERA VE ÇERÇEVE TAM UYUMLU */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1.4', background: '#000', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
        
        {/* VIDEO (Sadece çerçevenin içinde) */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />

        {/* BARKOD ÇERÇEVESİ OVERLAY */}
        <div style={{ position: 'absolute', inset: '0', pointerEvents: 'none' }}>
          {/* KÖŞE ÇİZGİLERİ (BEYAZ) */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '30px', height: '30px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', borderTop: '4px solid #fff', borderRight: '4px solid #fff' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '30px', height: '30px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '30px', height: '30px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }} />

          {/* KIRMIZI LAZER (RESİMDEKİ GİBİ TAM ORTADA) */}
          {scanning && (
            <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: 'red', boxShadow: '0 0 10px red', opacity: 0.8 }} />
          )}
        </div>

        {/* 4 NOLU ALAN: RESİMDEKİ İKONUN AYNISI (TRANSPARAN BEYAZ DAİRE + SİYAH İKON) */}
        <button
          onClick={scanning ? stop : start}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.8)', // Hafif transparan beyaz
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}
        >
          {/* FOTOĞRAF MAKİNESİ İKONU (SİYAH) */}
          <span className="material-icons" style={{ color: '#000', fontSize: '22px' }}>
            photo_camera
          </span>
        </button>

        {/* PROCESSING */}
        {processing && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', zIndex: 20 }}>
            OKUNUYOR...
          </div>
        )}
      </div>

      <link href="https://googleapis.com" rel="stylesheet" />
    </div>
  );
}
