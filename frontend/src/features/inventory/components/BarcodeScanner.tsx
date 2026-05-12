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

  const [lastCode, setLastCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lock = useRef(false);

  useEffect(() => {

    readerRef.current = new BrowserMultiFormatReader();

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
      .catch(() => setError('Kamera listesi alınamadı'));

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

      setError(null);

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

          setLastCode(code);
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
      setError('Kamera başlatılamadı');
      setScanning(false);
    }
  };

  const stop = () => {

    try {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      (readerRef.current as any)?.reset?.();
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}

    setScanning(false);
    setProcessing(false);
    setLastCode(null);
  };

  return (
    <div style={{
      width: '92%',
      maxWidth: '320px',
      margin: '12px auto',
      background: '#111827',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid #334155',
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    }}>

      {/* HEADER */}
      <div style={{
        height: '52px',
        padding: '0 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b',
        background: '#0f172a',
      }}>

        <span style={{ fontWeight: 800, color: '#fff', fontSize: '15px' }}>
          Barkod Tarayıcı
        </span>

        <div style={{ display: 'flex', gap: '10px' }}>

          <button
            onClick={switchCamera}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: 'none',
              background: '#1e293b',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            🔄
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: '#1e293b',
                color: '#cbd5e1',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}

        </div>
      </div>

      {/* CAMERA */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '220px',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* MASK */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <svg width="100%" height="100%">
            <defs>
              <mask id="m">
                <rect width="100%" height="100%" fill="white" />
                <rect x="50%" y="50%" width="220" height="120" rx="20" fill="black" transform="translate(-110,-60)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#m)" />
          </svg>
        </div>

        {/* FRAME */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '220px',
          height: '120px',
          transform: 'translate(-110px,-60px)',
        }}>

          {/* CAMERA ICON BUTTON (TEK KONTROL) */}
          <button
            onClick={scanning ? stop : start}
            style={{
              position: 'absolute',
              top: '-42px',
              right: '-10px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: scanning ? '#ef4444' : '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              pointerEvents: 'auto',
            }}
          >
            <span className="material-icons" style={{ color: '#fff', fontSize: '20px' }}>
              {scanning ? 'stop' : 'photo_camera'}
            </span>
          </button>

          {/* FRAME CORNERS */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 26, height: 26, borderTop: '5px solid white', borderLeft: '5px solid white' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 26, height: 26, borderTop: '5px solid white', borderRight: '5px solid white' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 26, height: 26, borderBottom: '5px solid white', borderLeft: '5px solid white' }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderBottom: '5px solid white', borderRight: '5px solid white' }} />

        </div>

        {/* PROCESSING */}
        {processing && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15,23,42,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            İŞLENİYOR...
          </div>
        )}

      </div>

      {/* MATERIAL ICONS */}
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

    </div>
  );
}
