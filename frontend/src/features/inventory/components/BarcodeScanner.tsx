'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

export default function MobilStokScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const lock = useRef(false);

  useEffect(() => {
    const hints = new Map();
    const formats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE
    ];

    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    readerRef.current = new BrowserMultiFormatReader(hints);

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((d) => {
        setDevices(d);

        const backCam = d.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('arka') ||
          device.label.toLowerCase().includes('rear')
        );

        setDeviceId(backCam ? backCam.deviceId : (d[0]?.deviceId || ''));
      })
      .catch(() => setError('Kamera listesi alınamadı'));

    return () => stop();
  }, []);

  const start = async () => {
    try {
      setError(null);
      if (!videoRef.current || !readerRef.current) return;

      setScanning(true);

      const constraints: any = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          focusMode: 'continuous',
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const track = stream.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities?.() || {};

      if (capabilities.focusMode?.includes('continuous')) {
        await track.applyConstraints({
          advanced: [{ focusMode: 'continuous' }]
        } as any);
      }

      readerRef.current.decodeFromStream(stream, videoRef.current, (res, err) => {
        if (res && !lock.current) {
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
      });
    } catch (e) {
      console.error(e);
      setError('Kamera başlatılamadı');
      setScanning(false);
    }
  };

  const stop = () => {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      readerRef.current?.reset?.();
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}

    setScanning(false);
    setProcessing(false);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      background: '#000',
      color: '#fff',
      fontFamily: 'sans-serif',
      minHeight: '100vh'
    }}>
      
      {/* ÜST BAŞLIK */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #222'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>☰</span>
          <span style={{ fontWeight: 600, fontSize: '18px' }}>Mobil Stok Sayım</span>
        </div>
        <span style={{ color: '#888', fontSize: '14px' }}>Depo: A</span>
      </div>

      <div style={{ padding: '12px 16px', color: '#888', fontSize: '14px' }}>
        Sayım Ekranı
      </div>

      {/* TARAYICI ALANI */}
      <div style={{
        position: 'relative',
        width: '92%',
        height: '240px',
        margin: '0 auto',
        background: '#111',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Odak Çerçevesi */}
        <div style={{ position: 'absolute', inset: '40px', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '25px', height: '25px', borderTop: '4px solid white', borderLeft: '4px solid white' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '25px', height: '25px', borderTop: '4px solid white', borderRight: '4px solid white' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '25px', height: '25px', borderBottom: '4px solid white', borderLeft: '4px solid white' }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '25px', height: '25px', borderBottom: '4px solid white', borderRight: '4px solid white' }} />
        </div>

        {/* Lazer çizgisi */}
        {scanning && !processing && <div className="laser" />}

        {/* Processing overlay */}
        {processing && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
              OKUNDU...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
