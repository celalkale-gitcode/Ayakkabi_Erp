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
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastScanRef = useRef<string | null>(null);
  const scanLockRef = useRef(false);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        setCameras(devices);

        const backCamera =
          devices.find((d) =>
            d.label?.toLowerCase().includes('back') ||
            d.label?.toLowerCase().includes('rear')
          ) || devices[0];

        setSelectedCamera(backCamera?.deviceId || '');
      })
      .catch(() => setError('Kamera listesi alınamadı'));

    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    if (!videoRef.current || !selectedCamera || !codeReader.current) return;

    setError(null);
    setIsScanning(true);

    stopScanner();

    try {
      // 🔥 CRITICAL: video autoplay fix
      videoRef.current.setAttribute('autoplay', 'true');
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.muted = true;

      controlsRef.current =
        await codeReader.current.decodeFromVideoDevice(
          selectedCamera,
          videoRef.current,
          (result) => {
            if (!result) return;

            const barkod = result.getText();

            if (scanLockRef.current) return;
            if (lastScanRef.current === barkod) return;
            if (!/^\d{13}$/.test(barkod)) return;

            scanLockRef.current = true;
            lastScanRef.current = barkod;

            navigator.vibrate?.(120);

            onResult(barkod);

            setTimeout(() => {
              scanLockRef.current = false;
              lastScanRef.current = null;
            }, 1500);
          }
        );
    } catch (err) {
      console.error(err);
      setError('Kamera başlatılamadı');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    try {
      controlsRef.current?.stop();
      controlsRef.current = null;

      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    } catch {}

    setIsScanning(false);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-sm bg-white rounded-3xl border shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b">
          <div>
            <h3 className="font-bold">Barkod Tarama</h3>
            <p className="text-xs text-slate-500">Kamerayı barkoda yönelt</p>
          </div>

          {onClose && <button onClick={onClose}>✕</button>}
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
            <div className="absolute inset-0 bg-black/50 pointer-events-none z-10" />

            {/* FRAME */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">

              <div className="relative w-[260px] h-[140px]">

                {/* BORDER */}
                <div className="absolute inset-0 border-4 border-cyan-400 rounded-2xl shadow-[0_0_30px_cyan]" />

                {/* SCAN LINE */}
                <div className="absolute w-full h-[3px] bg-red-500 top-1/2 animate-pulse" />

              </div>

            </div>
          </div>
        </div>

        {/* BUTTON */}
        <div className="px-4 pb-4">
          <button
            onClick={isScanning ? stopScanner : startScanner}
            className={`w-full py-3 rounded-xl font-bold text-white ${
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
      </div>
    </div>
  );
}
