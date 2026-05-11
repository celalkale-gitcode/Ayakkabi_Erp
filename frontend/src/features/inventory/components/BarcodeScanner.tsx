'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function MobilStokScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Görseldeki "Depo: A" ve "Sayım Ekranı" gibi statik başlıklar için
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
        if (res) {
          const code = res.getText().trim();
          if (navigator.vibrate) navigator.vibrate(100);
          onResult(code);
        }
      });
    } catch (e) {
      setError('Kamera başlatılamadı');
      setScanning(false);
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (readerRef.current) (readerRef.current as any).reset?.();
    setScanning(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', background: '#000', color: '#fff', fontFamily: 'sans-serif', minHeight: '450px' }}>
      
      {/* ÜST BAR (Görseldeki gibi) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #333', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>☰</span>
          <span style={{ fontWeight: 'bold' }}>Mobil Stok Sayım</span>
        </div>
        <span style={{ fontSize: '14px', color: '#ccc' }}>Depo: A</span>
      </div>

      <div style={{ padding: '10px 15px', fontSize: '14px', color: '#aaa' }}>
        Sayım Ekranı
      </div>

      {/* KAMERA ALANI */}
      <div style={{ position: 'relative', width: '90%', height: '220px', margin: '0 auto', backgroundColor: '#111', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        
        {/* Köşe Çerçeveleri (Beyaz L şekilleri) */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '3px solid #fff', borderLeft: '3px solid #fff' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderTop: '3px solid #fff', borderRight: '3px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderBottom: '3px solid #fff', borderLeft: '3px solid #fff' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '3px solid #fff', borderRight: '3px solid #fff' }} />

        {/* KIRMIZI TARAMA ÇİZGİSİ */}
        {scanning && <div className="laser-line" />}

        {/* Sağ Üst Kamera İkonu */}
        <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '4px' }}>
           📷
        </div>
      </div>

      {/* ALT MENÜ (Barkod Tara - Ürün Detayı - Adet Giriniz) */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px 0', fontSize: '13px', fontWeight: 'bold' }}>
        <span style={{ borderBottom: '2px solid #fff', paddingBottom: '5px' }}>Barkod Tara</span>
        <span style={{ color: '#888' }}>Ürün Detayı</span>
        <span style={{ color: '#888' }}>Adet Giriniz</span>
      </div>

      {/* KONTROL BUTONU */}
      <div style={{ padding: '0 20px 20px' }}>
        <button
          onClick={scanning ? stop : start}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: scanning ? '#ff4444' : '#444',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {scanning ? 'TARAMAYI DURDUR' : 'TARAMAYA BAŞLA'}
        </button>
      </div>

      <style jsx>{`
        .laser-line {
          position: absolute;
          left: 5%;
          right: 5%;
          height: 2px;
          background-color: #ff0000;
          box-shadow: 0 0 8px #ff0000;
          z-index: 20;
          animation: scan 2s infinite ease-in-out;
        }
        @keyframes scan {
          0% { top: 20%; }
          50% { top: 80%; }
          100% { top: 20%; }
        }
      `}</style>
    </div>
  );
}
