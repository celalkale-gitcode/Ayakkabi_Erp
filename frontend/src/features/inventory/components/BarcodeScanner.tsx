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
        setDeviceId(d?.[0]?.deviceId || '');
      })
      .catch(() => setError('Kamera listesi alınamadı'));

    return () => stop();
  }, []);

  // START (BACK CAMERA FIXED)
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
          if (!res) return;

          const code = res.getText();

          if (lock.current) return;
          if (last.current === code) return;
          if (!/^\d{13}$/.test(code)) return;

          lock.current = true;
          last.current = code;

          navigator.vibrate?.(120);
          onResult(code);

          setTimeout(() => {
            lock.current = false;
            last.current = null;
          }, 1200);
        }
      );
    } catch (e) {
      console.error(e);
      setError('Kamera açılamadı (izin kontrol et)');
      setScanning(false);
    }
  };

  const stop = () => {
    try {
      // Stream durdurma
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      // HATA VEREN KISIM DÜZELTİLDİ:
      // @ts-ignore - TypeScript'in BrowserMultiFormatReader üzerinde reset metodunu görmesini zorluyoruz
      if (readerRef.current && typeof (readerRef.current as any).reset === 'function') {
        // @ts-ignore
        (readerRef.current as any).reset();
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.warn("Durdurma sırasında hata oluştu (kritik değil):", err);
    }

    setScanning(false);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between px-4 py-3 bg-slate-50 border-b relative z-50">
          <div>
            <h3 className="font-bold">AI Barkod Scanner</h3>
            <p className="text-xs text-slate-500">Pro mod + stabil kamera</p>
          </div>

          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
              ✕
            </button>
          )}
        </div>

        {/* CAMERA SELECT */}
        <div className="p-3">
          <select
            className="w-full border rounded-xl p-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Kamera ${devices.indexOf(d) + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* CAMERA AREA */}
        <div className="px-4 pb-4">
          <div className="relative w-full h-[340px] bg-black rounded-2xl overflow-hidden">

            {/* VIDEO */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* DARK MASK */}
            <div className="absolute inset-0 bg-black/55 z-10 pointer-events-none" />

            {/* FIXED FRAME LAYER */}
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">

              <div className="relative w-[260px] h-[140px]">

                {/* MAIN FRAME */}
                <div className="absolute inset-0 rounded-2xl border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.95)]" />

                {/* SCAN LINE */}
                <div
                  className="absolute left-0 w-full h-[3px] bg-red-500"
                  style={{
                    animation: 'scan 1.8s linear infinite',
                    boxShadow: '0 0 15px red',
                  }}
                />

                {/* CORNERS */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-cyan-300" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-cyan-300" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-cyan-300" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-cyan-300" />

              </div>

            </div>

          </div>
        </div>

        {/* BUTTON */}
        <div className="px-4 pb-4">
          <button
            onClick={scanning ? stop : start}
            className={`w-full py-3 rounded-xl font-bold text-white transition active:scale-95 ${
              scanning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {scanning ? 'Durdur' : 'Kamerayı Aç'}
          </button>

          {error && (
            <p className="text-red-500 text-xs mt-2 text-center font-medium">
              {error}
            </p>
          )}
        </div>

        <style jsx>{`
          @keyframes scan {
            0% { transform: translateY(0); }
            50% { transform: translateY(130px); }
            100% { transform: translateY(0); }
          }
        `}</style>

      </div>
    </div>
  );
}
