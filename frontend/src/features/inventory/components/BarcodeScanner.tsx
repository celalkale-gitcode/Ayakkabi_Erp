'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface Props {
  onResult: (code: string) => void;
  onClose?: () => void;
}

export default function BarkodScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastRef = useRef<string | null>(null);
  const lockRef = useRef(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((list) => {
        setDevices(list);

        const back = list.find((d) =>
          d.label?.toLowerCase().includes('back') ||
          d.label?.toLowerCase().includes('rear')
        );

        setDeviceId(back?.deviceId || list[0]?.deviceId || '');
      })
      .catch(() => setError('Kamera listesi alınamadı'));

    return () => stop();
  }, []);

  const start = async () => {
    if (!readerRef.current || !videoRef.current || !deviceId) return;

    setError(null);
    setScanning(true);

    stop();

    try {
      controlsRef.current =
        await readerRef.current.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (res) => {
            if (!res) return;

            const code = res.getText();

            if (lockRef.current) return;
            if (lastRef.current === code) return;
            if (!/^\d{13}$/.test(code)) return;

            lockRef.current = true;
            lastRef.current = code;

            navigator.vibrate?.(120);

            onResult(code);

            setTimeout(() => {
              lockRef.current = false;
              lastRef.current = null;
            }, 1500);
          }
        );
    } catch (e) {
      console.log(e);
      setError('Kamera açılamadı');
      setScanning(false);
    }
  };

  const stop = () => {
    try {
      controlsRef.current?.stop();
      controlsRef.current = null;

      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());

        videoRef.current.srcObject = null;
      }
    } catch {}

    setScanning(false);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b z-20 relative">
          <div>
            <h3 className="font-bold">Barkod Tarayıcı</h3>
            <p className="text-xs text-slate-500">Kamerayı ortala</p>
          </div>

          {onClose && <button onClick={onClose}>✕</button>}
        </div>

        {/* CAMERA SELECT */}
        <div className="p-3 z-20 relative">
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
          <div className="relative w-full h-[340px] rounded-2xl overflow-hidden bg-black">

            {/* VIDEO (EN ALT KATMAN) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none" />

            {/* ===== FRAME LAYER (EN ÖNEMLİ KISIM) ===== */}
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">

              <div className="relative w-[260px] h-[140px]">

                {/* OUTLINE FRAME */}
                <div className="absolute inset-0 border-4 border-cyan-400 rounded-2xl shadow-[0_0_35px_cyan]" />

                {/* CORNERS (görsel güçlendirme) */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-cyan-300" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-cyan-300" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-cyan-300" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-cyan-300" />

                {/* SCAN LINE */}
                <div className="absolute w-full h-[3px] bg-red-500 animate-[scan_2s_linear_infinite]" />
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

          {error && (
            <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
          )}
        </div>

        {/* ANIMATION */}
        <style jsx>{`
          @keyframes scan {
            0% { transform: translateY(0px); }
            50% { transform: translateY(130px); }
            100% { transform: translateY(0px); }
          }
        `}</style>

      </div>
    </div>
  );
}
