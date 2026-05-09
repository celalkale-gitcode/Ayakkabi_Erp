'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function BarkodScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [scanning, setScanning] = useState(false);

  const last = useRef<string | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((d) => {
        setDevices(d);
        setDeviceId(d?.[0]?.deviceId || '');
      });

    return () => stop();
  }, []);

  const start = async () => {
    if (!readerRef.current || !videoRef.current) return;

    stop();
    setScanning(true);

    controlsRef.current =
      await readerRef.current.decodeFromVideoDevice(
        deviceId,
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
          }, 1500);
        }
      );
  };

  const stop = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;

    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());

      videoRef.current.srcObject = null;
    }

    setScanning(false);
  };

  return (
    <div className="w-full flex justify-center">

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between px-4 py-3 bg-slate-50 border-b z-20 relative">
          <div>
            <h3 className="font-bold">Barkod Tarayıcı</h3>
            <p className="text-xs text-slate-500">Frame artık kesin görünür</p>
          </div>
          {onClose && <button onClick={onClose}>✕</button>}
        </div>

        {/* SELECT */}
        <div className="p-3">
          <select
            className="w-full border rounded-xl p-2 text-sm"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || 'Kamera'}
              </option>
            ))}
          </select>
        </div>

        {/* CAMERA AREA */}
        <div className="px-4 pb-4">

          {/* CRITICAL WRAPPER */}
          <div className="relative w-full h-[340px] bg-black rounded-2xl overflow-hidden">

            {/* VIDEO (FIXED SIZE GUARANTEE) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* DARK LAYER */}
            <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />

            {/* 🔥 FRAME LAYER (DEBUGGED + FORCED TOP) */}
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">

              {/* FRAME BOX */}
              <div
                className="
                  w-[260px]
                  h-[140px]
                  relative
                "
                style={{
                  border: '4px solid #22d3ee',
                  borderRadius: '18px',
                  boxShadow: '0 0 35px rgba(34,211,238,0.9)',
                }}
              >

                {/* CORNERS (EXTRA VISUAL FIX) */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-cyan-300" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-cyan-300" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-cyan-300" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-cyan-300" />

                {/* SCAN LINE */}
                <div
                  className="absolute w-full h-[3px] bg-red-500"
                  style={{
                    animation: 'scan 2s linear infinite',
                    boxShadow: '0 0 15px red',
                  }}
                />

              </div>

            </div>

          </div>
        </div>

        {/* BUTTON */}
        <div className="px-4 pb-4 z-20 relative">
          <button
            onClick={scanning ? stop : start}
            className={`w-full py-3 rounded-xl font-bold text-white ${
              scanning ? 'bg-red-500' : 'bg-blue-600'
            }`}
          >
            {scanning ? 'Durdur' : 'Kamerayı Aç'}
          </button>
        </div>

        {/* ANIMATION */}
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
