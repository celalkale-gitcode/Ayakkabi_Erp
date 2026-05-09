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

      readerRef.current.decodeFromStream(
        stream,
        videoRef.current,
        (res) => {
          if (!res || lock.current) return;
          const code = res.getText();
          if (last.current === code || !/^\d{13}$/.test(code)) return;

          lock.current = true;
          last.current = code;
          navigator.vibrate?.(120);
          onResult(code);

          setTimeout(() => {
            lock.current = false;
            last.current = null;
          }, 1500);
        }
      );
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
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Barkod Okuyucu</h3>
          </div>
          {onClose && <button onClick={onClose} className="text-slate-400 p-1">✕</button>}
        </div>

        {/* CAMERA AREA */}
        <div className="relative w-full h-[360px] bg-black">
          {/* 1. VIDEO LAYER */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* 2. OVERLAY LAYER (Karanlık Maske) */}
          <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

          {/* 3. FRAME LAYER (EN ÜSTTE) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="relative w-[280px] h-[160px]">
              {/* Köşe Çizgileri */}
              <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
              <div className="absolute inset-0 border-4 border-cyan-400 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              
              {/* Hareketli Tarama Çizgisi */}
              <div className="absolute left-2 right-2 h-[2px] bg-red-500 shadow-[0_0_10px_red] animate-scan" />
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="p-4 space-y-3 bg-white">
          <select
            className="w-full border rounded-xl p-2 text-xs bg-slate-50 outline-none"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || 'Kamera'}</option>
            ))}
          </select>

          <button
            onClick={scanning ? stop : start}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
              scanning ? 'bg-red-500' : 'bg-blue-600 shadow-lg shadow-blue-200'
            }`}
          >
            {scanning ? 'Durdur' : 'Kamerayı Başlat'}
          </button>
        </div>

        <style jsx global>{`
          @keyframes scan {
            0% { top: 10%; }
            50% { top: 90%; }
            100% { top: 10%; }
          }
          .animate-scan {
            position: absolute;
            animation: scan 2s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
