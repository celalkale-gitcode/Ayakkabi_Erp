'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface BarkodScannerProps {
  onResult: (barkod: string) => void;
  onClose?: () => void;
}

export default function BarkodScanner({ onResult, onClose }: BarkodScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  // Kameraları yükle
  useEffect(() => {
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          // Varsa arka kamerayı varsayılan seç (mobil için)
          const backCam = videoDevices.find(d => d.label.toLowerCase().includes('back'));
          setSelectedCamera(backCam?.deviceId || videoDevices[0].deviceId);
        }
      })
      .catch(() => setError('Kamera izni alınamadı.'));
  }, []);

  const taramayiBaslat = async () => {
    if (!selectedCamera || !videoRef.current) return;
    setIsScanning(true);
    setError(null);

    try {
      await codeReader.current.decodeFromVideoDevice(
        selectedCamera,
        videoRef.current,
        (result) => {
          if (result) {
            onResult(result.getText()); // Barkodu ana bileşene gönder
            if (onClose) onClose(); // Başarılı okumada kapat
          }
        }
      );
    } catch (err) {
      setError('Tarayıcı başlatılamadı.');
      setIsScanning(false);
    }
  };

  const taramayiDurdur = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  // Bileşen kapandığında kamerayı durdur
  useEffect(() => {
    return () => taramayiDurdur();
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xl max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Barkod Tarat</h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-red-500">✕</button>
        )}
      </div>

      <select
        value={selectedCamera}
        onChange={(e) => setSelectedCamera(e.target.value)}
        className="w-full mb-3 p-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
      >
        {cameras.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>{d.label || 'Kamera'}</option>
        ))}
      </select>

      <div className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden mb-4 ring-4 ring-slate-50">
        <video ref={videoRef} className="w-full h-full object-cover" />
        <div className="absolute inset-0 border-[30px] border-black/40 flex items-center justify-center">
          <div className="w-full h-full border-2 border-blue-400 relative">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
          </div>
        </div>
      </div>

      <button
        onClick={isScanning ? taramayiDurdur : taramayiBaslat}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          isScanning ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
        }`}
      >
        {isScanning ? 'Taramayı Durdur' : 'Kamerayı Aç'}
      </button>

      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
