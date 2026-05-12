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
  const [deviceIndex, setDeviceIndex] = useState(0);
  const [deviceId, setDeviceId] = useState('');
  const lock = useRef(false);

  useEffect(() => {
    readerRef. current = new BrowserMultiFormatReader();
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((d) => {
        setDevices(d);
        const backCamIndex = d.findIndex(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('arka')
        );
        const selectedIndex = backCamIndex >= 0 ? backCamIndex : 0;
        setDeviceIndex(selectedIndex);
        setDeviceId(d[selectedIndex]?.deviceId || '');
      })
      .catch(() => console.error('Kamera listesi alınamadı'));

    return () => stop();
  }, []);

  useEffect(() => {
    if (scanning && deviceId) start();
  }, [deviceId]);

  const switchCamera = () => {
    if (devices.length <= 1) return;
    const nextIndex = (deviceIndex + 1) % devices.length;
    setDeviceIndex(nextIndex);
    setDeviceId(devices[nextIndex].deviceId);
  };

  const start = async () => {
    try {
      if (!videoRef.current || !readerRef.current) return;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      readerRef.current.decodeFromStream(
        stream,
        videoRef.current,
        (res) => {
          if (!res || lock.current) return;
          const code = res.getText().trim();
          lock.current = true;
          setProcessing(true);
          if (navigator.vibrate) navigator.vibrate(100);
          onResult(code);
          setTimeout(() => {
            setProcessing(false);
            lock.current = false;
          }, 2000);
        }
      );
    } catch (e) {
      setScanning(false);
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    (readerRef.current as any)?.reset?.();
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
    setProcessing(false);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
      margin: '0 auto',
      background: '#111827',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid #334155',
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    }}>
      {/* HEADER */}
      <div style={{
        height: '52px',
        padding: '0 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
      }}>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Barkod Tarayıcı</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={switchCamera} style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>🔄</button>
          {onClose && <button onClick={onClose} style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>✕</button>}
        </div>
      </div>

      {/* CAMERA AREA - Yükseklik senin çizdiğin seviyeye çekildi */}
      <div style={{ position: 'relative', width: '100%', height: '260px', background: '#000' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        
        {/* MASK / OVERLAY */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}>
           {/* SCANNING FRAME - Çizdiğin geniş ve basık form */}
           <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              height: '120px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              boxSizing: 'border-box'
           }}>
              {/* CORNERS */}
              <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff', borderRadius: '4px 0 0 0' }} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #fff', borderRight: '4px solid #fff', borderRadius: '0 4px 0 0' }} />
              <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff', borderRadius: '0 0 0 4px' }} />
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff', borderRadius: '0 0 4px 0' }} />
              
              {/* PROFESYONEL VE TRANSPARAN İKON */}
              <button
                onClick={scanning ? stop : start}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '15px',
                  transform: 'translateY(-50%)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span className="material-icons" style={{ color: '#fff', fontSize: '22px', opacity: 0.9 }}>
                  {scanning ? 'pause' : 'videocam'}
                </span>
              </button>
           </div>
        </div>

        {/* PROCESSING OVERLAY */}
        {processing && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
            OKUNUYOR...
          </div>
        )}
      </div>
      <link href="https://googleapis.com" rel="stylesheet" />
    </div>
  );
}
