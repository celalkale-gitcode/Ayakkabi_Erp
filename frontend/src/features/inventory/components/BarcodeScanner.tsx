'use client';

import React, { useEffect, useRef, useState } from 'react';
// Sadece browser paketini kullanıyoruz, çakışmayı önlemek için library'i siliyoruz
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/browser';

export default function BarkodScanner({ onResult }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // Odaklanma ve hız ayarları
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13, 
      BarcodeFormat.CODE_128, 
      BarcodeFormat.EAN_8
    ]);

    readerRef.current = new BrowserMultiFormatReader(hints);

    // Cihaz listeleme
    BrowserMultiFormatReader.listVideoInputDevices().then((devices) => {
      const back = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('arka'));
      setDeviceId(back?.deviceId || devices[0]?.deviceId || '');
    });

    return () => stop();
  }, []);

  const start = async () => {
    if (!deviceId || !videoRef.current || !readerRef.current) return;
    try {
      setScanning(true);
      setProcessing(false);

      // Render hatasını çözen doğru metod: decodeFromVideoDevice
      const controls = await readerRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result) => {
          if (result && !processing) {
            setProcessing(true);
            if (navigator.vibrate) navigator.vibrate(100);
            onResult(result.getText());
            setTimeout(() => setProcessing(false), 2000);
          }
        }
      );
      controlsRef.current = controls;
    } catch (e) {
      setScanning(false);
    }
  };

  const stop = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
    setProcessing(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', overflow: 'hidden' }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '1.5', 
        background: '#000', 
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden'
      }}>
        <video ref={videoRef} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* PRO KÖŞE ÇİZGİLERİ (1mm İçeride) */}
        <div style={{ position: 'absolute', top: '2px', left: '2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', top: '2px', right: '2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderRight: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: '2px', left: '2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }} />

        {/* BLUR KIRMIZI LAZER */}
        {scanning && !processing && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '12%', 
            right: '12%', 
            height: '2px', 
            background: 'rgba(255, 0, 0, 0.4)', 
            boxShadow: '0 0 12px 3px rgba(255, 0, 0, 0.6)', 
            zIndex: 5 
          }} />
        )}

        {/* ŞEFFAF İŞLENİYOR */}
        {processing && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'rgba(0,0,0,0.45)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
            zIndex: 20
          }}>
            <span style={{ color: '#fff', fontWeight: '500', fontSize: '16px', letterSpacing: '1px' }}>İŞLENİYOR...</span>
          </div>
        )}

        {/* BEYAZ ŞEFFAF BUTON + SİYAH İKON */}
        {!processing && (
          <button
            onClick={scanning ? stop : start}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.65)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
