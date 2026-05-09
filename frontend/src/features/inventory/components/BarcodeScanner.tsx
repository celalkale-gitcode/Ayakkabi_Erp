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
        if (d.length > 0) setDeviceId(d[0].deviceId);
      })
      .catch(() => setError('Kamera listesi alınamadı'));
    return () => stop();
  }, []);

  const start = async () => {
    try {
      setError(null);
      if (!videoRef.current || !readerRef.current) return;
      stop();
      setScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : { ideal: 'environment' },
        },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      readerRef.current.decodeFromStream(stream, videoRef.current, (res) => {
        if (!res || lock.current) return;
        const code = res.getText();
        if (last.current === code || !/^\d{13}$/.test(code)) return;

        lock.current = true;
        last.current = code;
        navigator.vibrate?.(120);
        onResult(code);
        setTimeout(() => { lock.current = false; last.current = null; }, 1500);
      });
    } catch (e) {
      setError('Kamera açılamadı');
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
    <div className="flex flex-col items-center w-full max-w-md mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
      
      {/* HEADER */}
      <div className="w-full flex justify-between items-center px-6 py-4 border-b bg-white z-50">
        <span className="font-bold text-slate-800">Barkod Tarayıcı</span>
        {onClose && <button onClick={onClose} className="p-1 text-slate-400">✕</button>}
      </div>

      {/* TARAMA ALANI (VİDEO VE ÇERÇEVE BURADA BİRLEŞİK) */}
      <div className="relative w-full h-[350px] bg-black overflow-hidden">
        {/* VIDEO - EN ALTTA */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* MASKE VE ÇERÇEVE - VİDEONUN ÜSTÜNDE */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          {/* SVG Maske: Kenarları koyulaştırır, ortayı açar */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <mask id="hole">
                <rect width="100%" height="100%" fill="white" />
                <rect x="50%" y="50%" width="250" height="150" rx="20" fill="black" transform="translate(-125, -75)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#hole)" />
          </svg>

          {/* 4 KÖŞE ÇERÇEVE ÇİZGİLERİ */}
          <div className="relative w-[250px] h-[150px]">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
            
            {/* HAREKETLİ TARAMA ÇİZGİSİ */}
            <div className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_15px_red] animate-scan-fast" />
          </div>
        </div>
      </div>

      {/* KONTROLLER - EN ALTTA */}
      <div className="w-full p-6 bg-white space-y-4">
        <select
          className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Kamera ${devices.indexOf(d) + 1}`}</option>
          ))}
        </select>

        <button
          onClick={scanning ? stop : start}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95 ${
            scanning ? 'bg-red-500' : 'bg-blue-600 shadow-lg shadow-blue-100'
          }`}
        >
          {scanning ? 'DURDUR' : 'TARAMAYI BAŞLAT'}
        </button>

        {error && <p className="text-red-500 text-center text-xs">{error}</p>}
      </div>

      <style jsx global>{`
        @keyframes scanLine {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        .animate-scan-fast {
          position: absolute;
          animation: scanLine 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

