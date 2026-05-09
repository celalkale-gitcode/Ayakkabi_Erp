'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function BarkodScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const last = useRef<string | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    return () => stop();
  }, []);

  // 🔥 ARKA KAMERA ZORLAMA (FIX)
  const start = async () => {
    try {
      setError(null);

      if (!readerRef.current || !videoRef.current) return;

      stop();
      setScanning(true);

      // 👉 FORCE BACK CAMERA
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // <-- CRITICAL FIX
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

          // 🔊 haptic + feedback
          navigator.vibrate?.(120);

          // optional beep
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            osc.frequency.value = 800;
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
          } catch {}

          onResult(code);

          setTimeout(() => {
            lock.current = false;
            last.current = null;
          }, 1200);
        }
      );
    } catch (e: any) {
      console.error(e);
      setError('Kamera açılamadı (izin verildi mi?)');
      setScanning(false);
    }
  };

  const stop = () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      readerRef.current?.reset?.();

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch {}

    setScanning(false);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between px-4 py-3 bg-slate-50 border-b z-20">
          <div>
            <h3 className="font-bold">AI Barkod Scanner</h3>
            <p className="text-xs text-slate-500">
              Arka kamera + auto focus aktif
            </p>
          </div>

          {onClose && <button onClick={onClose}>✕</button>}
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
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* DARK MASK */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />

            {/* 🔥 AI STYLE SCAN FRAME (FIXED VISIBILITY) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">

              <div className="relative w-[260px] h-[140px]">

                {/* glowing frame */}
                <div className="absolute inset-0 rounded-2xl border-4 border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.9)] animate-pulse" />

                {/* scanning line */}
                <div
                  className="absolute left-0 w-full h-[3px] bg-red-500"
                  style={{
                    animation: 'scan 1.8s linear infinite',
                    boxShadow: '0 0 12px red',
                  }}
                />

                {/* corner glow */}
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
            className={`w-full py-3 rounded-xl font-bold text-white ${
              scanning ? 'bg-red-500' : 'bg-blue-600'
            }`}
          >
            {scanning ? 'Durdur' : 'Kamerayı Aç'}
          </button>

          {error && (
            <p className="text-red-500 text-xs mt-2 text-center">
              {error}
            </p>
          )}
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
