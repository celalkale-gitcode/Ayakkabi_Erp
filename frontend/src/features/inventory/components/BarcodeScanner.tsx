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
    <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto', background: '#fff', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
      
      {/* HEADER */}
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 800, color: '#1e293b' }}>Barkod Tarayıcı</span>
        {onClose && <button onClick={onClose} style={{ border: 'none', background: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>}
      </div>

      {/* KRİTİK ALAN: TARAMA KAPSAYICISI */}
      <div style={{ position: 'relative', width: '100%', height: '350px', backgroundColor: '#000' }}>
        
        {/* KATMAN 1: VİDEO */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
        />

        {/* KATMAN 2: MASKE (Videonun üstüne zorla çivilenir) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" style={{ display: 'block' }}>
                <defs>
                    <mask id="scanMask">
                        <rect width="100%" height="100%" fill="white" />
                        <rect x="50%" y="50%" width="260" height="160" rx="24" fill="black" transform="translate(-130, -80)" />
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#scanMask)" />
            </svg>
        </div>

        {/* KATMAN 3: ÇERÇEVE VE ÇİZGİ */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '260px', height: '160px', zIndex: 10, pointerEvents: 'none', transform: 'translate(-130px, -80px)' }}>
            {/* Köşeler */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '32px', height: '32px', borderTop: '5px solid white', borderLeft: '5px solid white', borderTopLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '32px', height: '32px', borderTop: '5px solid white', borderRight: '5px solid white', borderTopRightRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '32px', borderBottom: '5px solid white', borderLeft: '5px solid white', borderBottomLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderBottom: '5px solid white', borderRight: '5px solid white', borderBottomRightRadius: '16px' }} />
            
            {/* Tarama Çizgisi */}
            <div className="scanner-line" style={{ position: 'absolute', left: '10px', right: '10px', height: '3px', background: '#ef4444', boxShadow: '0 0 15px #ef4444' }} />
        </div>
      </div>

      {/* KONTROLLER */}
      <div style={{ padding: '24px', background: '#fff' }}>
        <select
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #f1f5f9', marginBottom: '16px', outline: 'none', fontSize: '14px' }}
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Kamera ${devices.indexOf(d) + 1}`}</option>
          ))}
        </select>

        <button
          onClick={scanning ? stop : start}
          style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 900, color: '#fff', border: 'none', cursor: 'pointer', background: scanning ? '#ef4444' : '#2563eb', boxShadow: scanning ? '0 10px 20px rgba(239,68,68,0.2)' : '0 10px 20px rgba(37,99,235,0.2)' }}
        >
          {scanning ? 'DURDUR' : 'TARAMAYI BAŞLAT'}
        </button>
      </div>

      <style jsx global>{`
        @keyframes scanMove {
          0% { top: 15%; opacity: 0.4; }
          50% { top: 85%; opacity: 1; }
          100% { top: 15%; opacity: 0.4; }
        }
        .scanner-line {
          animation: scanMove 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
