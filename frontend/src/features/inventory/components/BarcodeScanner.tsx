'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface BarkodScannerProps {
  onResult: (barkod: string) => void;
  onClose?: () => void;
}

export default function BarkodScanner({
  onResult,
  onClose,
}: BarkodScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastScanRef = useRef<string | null>(null);
  const lockRef = useRef(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        setCameras(devices);

        const back = devices.find((d) =>
          d.label?.toLowerCase().includes('back') ||
          d.label?.toLowerCase().includes('rear')
        );

        setSelectedCamera(back?.deviceId || devices[0]?.deviceId || '');
      })
      .catch(() => setError('Kamera listesi alınamadı'));

    return () => stop();
  }, []);

  const start = async () => {
    if (!readerRef.current || !videoRef.current || !selectedCamera) return;

    setError(null);
    setIsScanning(true);

    stop();

    try {
      controlsRef.current =
        await readerRef.current.decodeFromVideoDevice(
          selectedCamera,
          videoRef.current,
          (result) => {
            if (!result) return;

            const code = result.getText();

            if (lockRef.current) return;
            if (lastScanRef.current === code) return;
            if (!/^\d{13}$/.test(code)) return;

            lockRef.current = true;
            lastScanRef.current = code;

            navigator.vibrate?.(120);

            onResult(code);

            setTimeout(() => {
              lockRef.current = false;
              lastScanRef.current = null;
            }, 1500);
          }
        );
    } catch (e) {
      console.log(e);
      setError('Kamera açılamadı');
      setIsScanning(false);
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

    setIsScanning(false);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b">
          <div>
            <h3 className="font-bold">Barkod Tarayıcı</h3>
            <p className="text-xs text-slate-500">Kamerayı barkoda yönelt</p>
          </div>

          {onClose && (
            <button onClick={onClose}>✕</button>
          )}
        </div>

        {/* CAMERA SELECT */}
        <div className="p-3">
          <select
            className="w-full border rounded-xl p-2 text-sm"
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
          >
            {cameras.map((c) => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label || 'Kamera'}
              </option>
            ))}
          </select>
        </div>

        {/* CAMERA AREA */}
        <div className="px-4 pb-4">
          <div className="relative w-full h-[340px] rounded-2xl overflow-hidden bg-black">

            {/* VIDEO (CRITICAL FIX) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />

            {/* BLUR SCAN ZONE (iPhone style) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

              <div className="relative w-[260px] h-[140px] rounded-2xl overflow-hidden">

                {/* clear center */}
                <div className="absolute inset-0 border-4 border-cyan-400 rounded-2xl shadow-[0_0_30px_cyan]" />

                {/* glow pulse */}
                <div className="absolute inset-0 animate-pulse bg-cyan-400/10" />

                {/* scan line */}
                <div className="absolute w-full h-[3px] bg-red-500 animate-[scan_2s_linear_infinite]" />

              </div>

            </div>
          </div>
        </div>

        {/* BUTTON */}
        <div className="px-4 pb-4">
          <button
            onClick={isScanning ? stop : start}
            className={`w-full py-3 rounded-xl font-bold text-white transition ${
              isScanning ? 'bg-red-500' : 'bg-blue-600'
            }`}
          >
            {isScanning ? 'Durdur' : 'Kamerayı Aç'}
          </button>

          {error && (
            <p className="text-red-500 text-xs mt-2 text-center">
              {error}
            </p>
          )}
        </div>

        {/* ANIMATION FIX */}
        <style jsx>{`
          @keyframes scan {
            0% { transform: translateY(0%); }
            50% { transform: translateY(130px); }
            100% { transform: translateY(0%); }
          }
        `}</style>

      </div>
    </div>
  );
}
