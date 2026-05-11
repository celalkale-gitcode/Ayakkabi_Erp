'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function BarkodScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false); 
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lock = useRef(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((d) => {
        setDevices(d);
        const backCam = d.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('arka')
        );
        setDeviceId(backCam ? backCam.deviceId : (d[0]?.deviceId || ''));
      })
      .catch(() => setError('Kamera listesi alınamadı'));
    return () => stop();
  }, []);

  useEffect(() => {
    if (scanning && deviceId) start();
  }, [deviceId]);

  const start = async () => {
    try {
      setError(null);
      if (!videoRef.current || !readerRef.current) return;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: deviceId ? { exact: deviceId } : undefined, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: 'environment' 
        }
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      readerRef.current.decodeFromStream(stream, videoRef.current, (res) => {
        if (!res || lock.current) return;
        const code = res.getText().trim();
        
        lock.current = true;
        setLastCode(code); 
        setProcessing(true); 
        
        if (navigator.vibrate) navigator.vibrate(100);
        onResult(code);

        setTimeout(() => {
          setProcessing(false);
          lock.current = false;
        }, 2000); 
      });
    } catch (e) {
      setError('Kamera başlatılamadı');
      setScanning(false);
    }
  };

  const stop = () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      // @ts-ignore
      if (readerRef.current) (readerRef.current as any).reset?.();
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
    setScanning(false);
    setProcessing(false);
    setLastCode(null); // Durdurunca son kodu temizle
  };

  return (
    <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto', background: '#fff', borderRadius: '32px', overflow: 'hidden', border: '2px solid #f1f5f9' }}>
      
      {/* BAŞLIK */}
      <div style={{ height: '60px', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontWeight: 800, color: '#0f172a' }}>Barkod Tarayıcı</span>
        {onClose && <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', color: '#64748b', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>}
      </div>

      {/* KAMERA ALANI */}
      <div style={{ position: 'relative', width: '100%', height: '340px', backgroundColor: '#000', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
        
        {/* MASKE */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
            <svg width="100%" height="100%">
                <defs>
                    <mask id="m">
                        <rect width="100%" height="100%" fill="white" />
                        <rect x="50%" y="50%" width="260" height="150" rx="24" fill="black" transform="translate(-130, -75)" />
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#m)" />
            </svg>
        </div>

        {/* ÇERÇEVE */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '260px', height: '150px', zIndex: 10, pointerEvents: 'none', transform: 'translate(-130px, -75px)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '32px', height: '32px', borderTop: '6px solid white', borderLeft: '6px solid white', borderTopLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '32px', height: '32px', borderTop: '6px solid white', borderRight: '6px solid white', borderTopRightRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '32px', borderBottom: '6px solid white', borderLeft: '6px solid white', borderBottomLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderBottom: '6px solid white', borderRight: '6px solid white', borderBottomRightRadius: '16px' }} />
            {!processing && <div className="scanner-line" style={{ position: 'absolute', left: '10px', right: '10px', height: '3px', background: 'red', boxShadow: '0 0 15px red' }} />}
        </div>

        {/* İŞLENİYOR EKRANI */}
        {processing && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '20px', fontWeight: 800, letterSpacing: '2px', fontSize: '16px' }}>İŞLENİYOR...</p>
          </div>
        )}
      </div>

      {/* ALT PANEL */}
      <div style={{ padding: '20px', background: '#fff' }}>
        
        {/* TEK BARKOD GÖSTERGESİ */}
        <div style={{ height: '44px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: lastCode ? '#f8fafc' : 'transparent', borderRadius: '12px', border: lastCode ? '1px solid #e2e8f0' : 'none' }}>
          {lastCode && (
            <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>
              Barkod: <span style={{ color: '#2563eb' }}>{lastCode}</span>
            </span>
          )}
        </div>
<select
  style={{
    width: '100%',
    height: '48px',
    padding: '0 12px',
    borderRadius: '12px',
    border: '2px solid #f1f5f9',
    marginBottom: '12px',
    outline: 'none',
    fontSize: '14px',
    fontWeight: 600
  }}
  value={deviceId}
  onChange={(e) => setDeviceId(e.target.value)}
>
  {devices.map((d, index) => {
    const label = d.label.toLowerCase();

    return (
      <option
        key={d.deviceId}
        value={d.deviceId}
      >
        {label.includes('front') ||
        label.includes('user') ||
        label.includes('ön')
          ? '📱 Ön Kamera'
          : label.includes('back') ||
            label.includes('rear') ||
            label.includes('environment') ||
            label.includes('arka')
          ? '📷 Arka Kamera'
          : `📷 Kamera ${index + 1}`}
      </option>
    );
  })}
</select>

        <button
          onClick={scanning ? stop : start}
          style={{ width: '100%', height: '56px', borderRadius: '16px', fontWeight: 800, color: '#fff', border: 'none', background: scanning ? '#ef4444' : '#2563eb', cursor: 'pointer' }}
        >
          {scanning ? 'DURDUR' : 'KAMERAYI BAŞLAT'}
        </button>
      </div>

      <style jsx global>{`
        @keyframes scanMove { 0% { top: 15%; } 50% { top: 85%; } 100% { top: 15%; } }
        .scanner-line { animation: scanMove 2s linear infinite; }
        .spinner { width: 48px; height: 48px; border: 5px solid rgba(255,255,255,0.2); border-top: 5px solid #fff; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
