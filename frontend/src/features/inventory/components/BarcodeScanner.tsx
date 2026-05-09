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
    <div className="flex flex-col w-full max-w-sm mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white relative z-50">
        <span className="font-bold text-slate-800">Barkod Tarayıcı</span>
        {onClose && <button onClick={onClose} className="p-1 text-slate-400 text-xl">✕</button>}
      </div>

      {/* TARAMA ALANI (GRID STACK) */}
      <div className="grid grid-cols-1 grid-rows-1 w-full h-[360px] bg-black relative overflow-hidden">
        
        {/* 1. KATMAN: VİDEO (Grid hücresine yayılır) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="col-start-1 row-start-1 w-full h-full object-cover"
          style={{ gridArea: '1 / 1 / 2 / 2' }}
        />

        {/* 2. KATMAN: MASKE (Videonun üstüne biner) */}
        <div 
          className="col-start-1 row-start-1 w-full h-full z-10 pointer-events-none"
          style={{ gridArea: '1 / 1 / 2 / 2' }}
        >
          <svg className="w-full h-full">
            <defs>
              <mask id="overlay-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect x="50%" y="50%" width="260" height="160" rx="24" fill="black" transform="translate(-130, -80)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#overlay-mask)" />
          </svg>
        </div>

        {/* 3. KATMAN: ÇERÇEVE VE ÇİZGİ (En üstte merkezlenir) */}
        <div 
          className="col-start-1 row-start-1 w-full h-full z-20 pointer-events-none flex items-center justify-center"
          style={{ gridArea: '1 / 1 / 2 / 2' }}
        >
          <div className="relative w-[260px] h-[160px]">
            {/* Beyaz Köşe Çizgileri */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-[5px] border-l-[5px] border-white rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-[5px] border-r-[5px] border-white rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[5px] border-l-[5px] border-white rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[5px] border-r-[5px] border-white rounded-br-2xl" />
            
            {/* Animasyonlu Çizgi */}
            <div className="absolute left-4 right-4 h-[3px] bg-red-500 shadow-[0_0_20px_red] animate-scan-fast" />
          </div>
        </div>
      </div>

      {/* KONTROLLER */}
      <div className="p-6 bg-white space-y-4">
        <select
          className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-600 outline-none transition-colors"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Kamera ${devices.indexOf(d) + 1}`}</option>
          ))}
        </select>

        <button
          onClick={scanning ? stop : start}
          className={`w-full py-4 rounded-2xl font-black text-white tracking-widest transition-all active:scale-95 ${
            scanning ? 'bg-red-500 shadow-lg shadow-red-100' : 'bg-blue-600 shadow-lg shadow-blue-100'
          }`}
        >
          {scanning ? 'DURDUR' : 'KAMERAYI BAŞLAT'}
        </button>
      </div>

      <style jsx global>{`
        @keyframes scanMove {
          0% { top: 15%; opacity: 0.3; }
          50% { top: 85%; opacity: 1; }
          100% { top: 15%; opacity: 0.3; }
        }
        .animate-scan-fast {
          position: absolute;
          animation: scanMove 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
