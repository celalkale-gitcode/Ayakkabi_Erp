'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

export default function BarkodScanner({ onResult }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    // Odaklanma ve hız için sadece barkod formatlarını tanımlıyoruz
    const hints = new Map();
    const formats = [BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE, BarcodeFormat.EAN_8];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true); // Daha derin analiz (Odaklanma yardımı)
    
    readerRef.current = new BrowserMultiFormatReader(hints);

    BrowserMultiFormatReader.listVideoInputDevices().then((devices) => {
      const back = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('arka'));
      setDeviceId(back?.deviceId || devices[0]?.deviceId || '');
    });
    return () => stop();
  }, []);

  const start = async () => {
    if (!deviceId || !videoRef.current) return;
    try {
      setScanning(true);
      setProcessing(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: { exact: deviceId },
          facingMode: 'environment',
          width: { ideal: 1280 }, // Netlik için yüksek çözünürlük
          height: { ideal: 720 },
          // @ts-ignore - Bazı tarayıcılarda odaklanma desteği
          focusMode: 'continuous' 
        }
      });
      
      videoRef.current.srcObject = stream;

      readerRef.current?.decodeFromVideoElement(videoRef.current, (result) => {
        if (result && !processing) {
          setProcessing(true);
          if (navigator.vibrate) navigator.vibrate(100);
          onResult(result.getText());
          setTimeout(() => setProcessing(false), 2000);
        }
      });
    } catch (e) {
      setScanning(false);
    }
  };

  const stop = () => {
    readerRef.current?.reset();
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
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

        {/* 1mm KÜÇÜLTÜLMÜŞ KÖŞE ÇİZGİLERİ */}
        <div style={{ position: 'absolute', top: '2px', left: '2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', top: '2px', right: '2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderRight: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: '2px', left: '2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }} />

        {/* BLUR VE ŞEFFAF LAZER */}
        {scanning && !processing && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '12%', 
            right: '12%', 
            height: '2px', 
            background: 'rgba(255, 0, 0, 0.4)', // Şeffaf kırmızı
            boxShadow: '0 0 12px 3px rgba(255, 0, 0, 0.6)', // Blur efekti
            zIndex: 5 
          }} />
        )}

        {/* ŞEFFAF İŞLENİYOR EKRANI */}
        {processing && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'rgba(0,0,0,0.5)', // Daha şeffaf arka plan
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(2px)', // Hafif cam efekti
            zIndex: 20
          }}>
            <span style={{ color: '#fff', fontWeight: '500', fontSize: '16px', letterSpacing: '1px' }}>İŞLENİYOR...</span>
          </div>
        )}

        {/* PRO İKON */}
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
              background: 'rgba(255, 255, 255, 0.7)',
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
