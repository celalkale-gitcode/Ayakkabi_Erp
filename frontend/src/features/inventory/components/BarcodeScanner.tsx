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
    <div className="w-full flex justify-center p-2">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b">
          <h3 className="font-bold text-slate-800 text-base">Barkod Tara</h3>
          {onClose && <button onClick={onClose} className="text-slate-400 text-xl hover:text-red-500 transition">✕</button>}
        </div>

        {/* CAMERA AREA */}
        <div className="relative w-full h-[400px] bg-black overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* 🔥 DİNAMİK MASKE KATMANI (Orta aydınlık, dışı koyu) */}
          <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
            <defs>
              <mask id="overlay-mask">
                <rect width="100%" height="100%" fill="white" />
                {/* Bu dikdörtgen orta alanı "delerek" aydınlık bırakır */}
                <rect x="50%" y="50%" width="260" height="160" fill="black" rx="20" transform="translate(-130, -80)" />
              </mask>
            </defs>
            {/* Maskeyi uygulayan koyu katman */}
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#overlay-mask)" />
          </svg>

          {/* FRAME LAYER (Köşe çizgileri) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="relative w-[260px] h-[160px]">
              
              {/* Beyaz Köşeler */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-[5px] border-l-[5px] border-white rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-[5px] border-r-[5px] border-white rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[5px] border-l-[5px] border-white rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[5px] border-r-[5px] border-white rounded-br-2xl" />

              {/* Tarama Çizgisi */}
              <div className="absolute left-4 right-4 h-[3px] bg-red-500 shadow-[0_0_20px_red] animate-scan" />
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="p-5 space-y-4 bg-white">
          <select
            className="w-full border-2 border-slate-100 rounded-2xl p-3 text-sm bg-slate-50 outline-none focus:border-blue-500 transition"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || 'Kamera'}</option>
            ))}
          </select>

          <button
            onClick={scanning ? stop : start}
            className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-wider transition-all active:scale-95 ${
              scanning ? 'bg-red-500 shadow-xl shadow-red-200' : 'bg-blue-600 shadow-xl shadow-blue-200'
            }`}
          >
            {scanning ? 'DURDUR' : 'KAMERAYI BAŞLAT'}
          </button>
        </div>

        <style jsx global>{`
          @keyframes scan {
            0% { top: 15%; opacity: 0.3; }
            50% { top: 85%; opacity: 1; }
            100% { top: 15%; opacity: 0.3; }
          }
          .animate-scan {
            position: absolute;
            animation: scan 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
