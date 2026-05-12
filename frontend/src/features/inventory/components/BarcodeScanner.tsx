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
        video: { 
          deviceId: deviceId ? { exact: deviceId } : undefined, 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
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
    <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto', background: '#000', borderRadius: '20px', overflow: 'hidden' }}>
      
      {/* PRO KAMERA KONTEYNERI */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1.2', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* VIDEO - Çerçevenin tam içine sığacak şekilde */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: '92%', height: '90%', objectFit: 'cover', borderRadius: '12px' }} 
        />

        {/* BARKOD ÇERÇEVESİ (Kameraya tam oturan) */}
        <div style={{ position: 'absolute', width: '92%', height: '90%', borderRadius: '12px', pointerEvents: 'none' }}>
          
          {/* KÖŞE ÇİZGİLERİ - Resimdeki gibi kalın ve belirgin */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff', borderRadius: '12px 0 0 0' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '30px', borderTop: '4px solid #fff', borderRight: '4px solid #fff', borderRadius: '0 12px 0 0' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff', borderRadius: '0 0 0 12px' }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff', borderRadius: '0 0 12px 0' }} />

          {/* HAREKETLİ LAZER TARAYICI */}
          {scanning && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '5%',
              right: '5%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, red, transparent)',
              boxShadow: '0 0 15px 2px red',
              animation: 'scan 2s infinite ease-in-out',
              zIndex: 5
            }} />
          )}
        </div>

        {/* PRO TRANSPARAN İKON (4 NOLU ALAN) */}
        <button
          onClick={scanning ? stop : start}
          style={{
            position: 'absolute',
            top: '25px',
            right: '25px',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.25)', // Transparan beyaz
            backdropFilter: 'blur(8px)', // Cam efekti
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.3s ease'
          }}
        >
          <span className="material-icons" style={{ color: '#fff', fontSize: '22px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            photo_camera
          </span>
        </button>

        {/* PROCESSING */}
        {processing && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', zIndex: 20, borderRadius: '20px' }}>
            TARANIYOR...
          </div>
        )}
      </div>

      {/* Lazer Animasyon CSS */}
      <style>{`
        @keyframes scan {
          0% { top: 20%; opacity: 0.2; }
          50% { top: 80%; opacity: 1; }
          100% { top: 20%; opacity: 0.2; }
        }
      `}</style>
      <link href="https://googleapis.com" rel="stylesheet" />
    </div>
  );
}
