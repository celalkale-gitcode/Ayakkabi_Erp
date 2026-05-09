'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function BarkodScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const last = useRef<string | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((d) => {
        setDevices(d);
        if (d.length > 0) setDeviceId(d[0].deviceId);
      })
      .catch(() => setError('Kamera listesi alınamadı'));
    return () => stop();
  }, []);

  const start = async () => {
    try {
      setError(null);
      if (!videoRef.current || !readerRef.current) return;
      stop();
      setScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : { ideal: 'environment' },
        },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      readerRef.current.decodeFromStream(stream, videoRef.current, (res) => {
        if (!res || lock.current) return;
        const code = res.getText();
        if (last.current === code || !/^\d{13}$/.test(code)) return;

        lock.current = true;
        last.current = code;
        navigator.vibrate?.(120);
        onResult(code);
        setTimeout(() => { lock.current = false; last.current = null; }, 1500);
      });
    } catch (e) {
      setError('Kamera açılamadı');
      setScanning(false);
    }
  };

  const stop = () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      // @ts-ignore
      if (readerRef.current && typeof (readerRef.current as any).reset === 'function') {
        // @ts-ignore
        (readerRef.current as any).reset();
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
    setScanning(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #eee' }}>
      
      {/* HEADER */}
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <span style={{ fontWeight: 'bold' }}>Barkod Tarayıcı</span>
        {onClose && <button onClick={onClose} style={{ color: '#999', fontSize: '20px' }}>✕</button>}
      </div>

      {/* TARAMA ALANI KAPSAYICISI */}
      <div style={{ position: 'relative', width: '100%', height: '350px', background: '#000', overflow: 'hidden' }}>
        
        {/* 1. KATMAN: VİDEO */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
        />

        {/* 2. KATMAN: MASKE VE ÇERÇEVE */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
          
          {/* SVG Maske */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <defs>
              <mask id="hole">
                <rect width="100%" height="100%" fill="white" />
                <rect x="50%" y="50%" width="260" height="160" rx="20" fill="black" transform="translate(-130, -80)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#hole)" />
          </svg>

          {/* Köşe Çizgileri */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '260px', height: '160px', transform: 'translate(-130px, -80px)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '32px', height: '32px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff', borderTopLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '32px', height: '32px', borderTop: '4px solid #fff', borderRight: '4px solid #fff', borderTopRightRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '32px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff', borderBottomLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff', borderBottomRightRadius: '16px' }} />
            
            {/* Tarama Çizgisi */}
            <div className="scan-line-animation" style={{ position: 'absolute', left: '8px', right: '8px', height: '2px', background: 'red', boxShadow: '0 0 15px red' }} />
          </div>
        </div>
      </div>

      {/* KONTROLLER */}
      <div style={{ padding: '20px', background: '#fff' }}>
        <select
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #f0f0f0', marginBottom: '16px', outline: 'none' }}
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Kamera ${devices.indexOf(d) + 1}`}</option>
          ))}
        </select>

        <button
          onClick={scanning ? stop : start}
          style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 'bold', color: '#fff', border: 'none', cursor: 'pointer', transition: '0.2s', background: scanning ? '#ef4444' : '#2563eb' }}
        >
          {scanning ? 'DURDUR' : 'TARAMAYI BAŞLAT'}
        </button>
        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '12px', marginTop: '10px' }}>{error}</p>}
      </div>

      <style jsx global>{`
        @keyframes scanMove {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        .scan-line-animation {
          animation: scanMove 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
