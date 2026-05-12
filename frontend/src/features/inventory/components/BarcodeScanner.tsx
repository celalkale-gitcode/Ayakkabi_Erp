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
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
      
      {/* KAMERA VE ÇERÇEVE ALANI (BOYUTLAR EŞİTLENDİ) */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#111' }}>
        
        {/* VIDEO */}
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* BARKOD ÇERÇEVESİ (Kamera ile aynı boyutta overlay) */}
        <div style={{ position: 'absolute', inset: '20px', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '8px' }}>
          
          {/* KÖŞE ÇİZGİLERİ */}
          <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }} />
          <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderRight: '4px solid #fff' }} />
          <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff' }} />
          <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }} />

          {/* LAZER ÇİZGİSİ */}
          {scanning && (
            <div style={{ position: 'absolute', top: '50%', left: '5%', right: '5%', height: '2px', background: 'red', boxShadow: '0 0 8px red', zIndex: 5 }} />
          )}
        </div>

        {/* KAMERA İKONU (4 NOLU ALAN) */}
        <button
          onClick={scanning ? stop : start}
          style={{
            position: 'absolute',
            top: '30px',
            right: '30px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            zIndex: 10
          }}
        >
          <span className="material-icons" style={{ color: '#000', fontSize: '20px' }}>
            {scanning ? 'videocam_off' : 'photo_camera'}
          </span>
        </button>

        {/* PROCESSING */}
        {processing && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', zIndex: 20 }}>
            İŞLENİYOR...
          </div>
        )}
      </div>

      <link href="https://googleapis.com" rel="stylesheet" />
    </div>
  );
}
