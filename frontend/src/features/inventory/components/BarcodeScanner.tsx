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
        // Varsayılan olarak arka kamerayı bulmaya çalış
        const backCam = d.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('arka'));
        setDeviceId(backCam ? backCam.deviceId : (d[0]?.deviceId || ''));
      })
      .catch(() => setError('Kamera listesi alınamadı'));
    return () => stop();
  }, []);

  useEffect(() => {
    if (scanning && deviceId) {
      start();
    }
  }, [deviceId]);

  const start = async () => {
    try {
      setError(null);
      if (!videoRef.current || !readerRef.current) return;
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      setScanning(true);

      // 🔥 DAHA İYİ OKUMA İÇİN ÇÖZÜNÜRLÜK AYARI
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
          focusMode: 'continuous' // Destekleyen cihazlarda sürekli netleme
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      readerRef.current.decodeFromStream(stream, videoRef.current, (res) => {
        if (!res || lock.current) return;
        
        const code = res.getText().trim();

        // 🔥 YANLIŞ OKUMAYI ENGELLEMEK İÇİN KONTROLLER
        // 1. Sadece tam olarak 13 haneli rakamları kabul et (EAN-13 için)
        if (!/^\d{13}$/.test(code)) return;
        
        // 2. Çok hızlı ardışık okumayı engelle
        if (last.current === code) return;

        lock.current = true;
        last.current = code;
        
        // Kullanıcıya geri bildirim (Titreşim)
        if (navigator.vibrate) navigator.vibrate(150);
        
        onResult(code);

        // Bir sonraki okuma için bekleme süresini artırdık (Yanlış stok artışını önler)
        setTimeout(() => {
          lock.current = false;
          last.current = null;
        }, 3000); // 3 saniye bekle
      });
    } catch (e) {
      setError('Kamera başlatılamadı. Lütfen izinleri kontrol edin.');
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
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 800, color: '#1e293b' }}>Hızlı Stok Tarayıcı</span>
        {onClose && <button onClick={onClose} style={{ border: 'none', background: 'none', color: '#94a3b8', fontSize: '20px' }}>✕</button>}
      </div>

      <div style={{ position: 'relative', width: '100%', height: '350px', backgroundColor: '#000' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
        
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
            <svg width="100%" height="100%">
                <defs>
                    <mask id="scanMask">
                        <rect width="100%" height="100%" fill="white" />
                        <rect x="50%" y="50%" width="260" height="160" rx="24" fill="black" transform="translate(-130, -80)" />
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#scanMask)" />
            </svg>
        </div>

        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '260px', height: '160px', zIndex: 10, pointerEvents: 'none', transform: 'translate(-130px, -80px)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '32px', height: '32px', borderTop: '6px solid white', borderLeft: '6px solid white', borderTopLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '32px', height: '32px', borderTop: '6px solid white', borderRight: '6px solid white', borderTopRightRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '32px', borderBottom: '6px solid white', borderLeft: '6px solid white', borderBottomLeftRadius: '16px' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderBottom: '6px solid white', borderRight: '6px solid white', borderBottomRightRadius: '16px' }} />
            <div className="scanner-line" style={{ position: 'absolute', left: '10px', right: '10px', height: '4px', background: '#ef4444', boxShadow: '0 0 20px red' }} />
        </div>
      </div>

      <div style={{ padding: '24px', background: '#fff' }}>
        <select
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #f1f5f9', marginBottom: '16px', outline: 'none' }}
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Kamera ${devices.indexOf(d) + 1}`}</option>
          ))}
        </select>

        <button
          onClick={scanning ? stop : start}
          style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 900, color: '#fff', border: 'none', background: scanning ? '#ef4444' : '#2563eb' }}
        >
          {scanning ? 'DURDUR' : 'TARAMAYI BAŞLAT'}
        </button>
        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '11px', marginTop: '8px' }}>{error}</p>}
      </div>

      <style jsx global>{`
        @keyframes scanMove { 0% { top: 15%; } 50% { top: 85%; } 100% { top: 15%; } }
        .scanner-line { animation: scanMove 2s linear infinite; }
      `}</style>
    </div>
  );
}
