'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function BarcodeScanner({ onResult }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    return () => {
      readerRef.current?.reset();
    };
  }, []);

  const start = async () => {
    try {
      setScanning(true);
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('arka'));
      const deviceId = backCam?.deviceId || devices[0]?.deviceId;

      readerRef.current?.decodeFromVideoDevice(deviceId, videoRef.current!, (result) => {
        if (result && !processing) {
          setProcessing(true);
          onResult(result.getText());
          setTimeout(() => setProcessing(false), 2000);
        }
      });
    } catch (err) {
      setScanning(false);
    }
  };

  const stop = () => {
    readerRef.current?.reset();
    setScanning(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '1.5', 
        background: '#000', 
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.2)',
        overflow: 'hidden'
      }}>
        {/* KAMERA ALANI */}
        <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* BARKOD ÇERÇEVESİ (KÖŞELER) */}
        <div style={{ position: 'absolute', inset: '0', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '2px', left: '2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff' }} />
          <div style={{ position: 'absolute', top: '2px', right: '2px', width: '25px', height: '25px', borderTop: '4px solid #fff', borderRight: '4px solid #fff' }} />
          <div style={{ position: 'absolute', bottom: '2px', left: '2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff' }} />
          <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '25px', height: '25px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff' }} />
        </div>

        {/* LAZER ÇİZGİSİ */}
        {scanning && !processing && (
          <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: 'rgba(255, 0, 0, 0.5)', boxShadow: '0 0 10px 2px red' }} />
        )}

        {/* İŞLENİYOR EKRANI */}
        {processing && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}>
            <span>İŞLENİYOR...</span>
          </div>
        )}

        {/* RESİMDEKİ PRO İKON (4 NOLU ALAN) */}
        <button
          onClick={scanning ? stop : start}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 15
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="black">
            <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
