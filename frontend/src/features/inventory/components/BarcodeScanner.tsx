'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

// Alt bileşenlerin (mock/temsili) tanımları - Kendi dosyalarından import edebilirsin
import ScanHistoryList from './ScanHistoryList';
import ManualProductModal from './ManualProductModal';

interface ScannedItem {
  sku: string;
  yeniStok: number;
  islemTarihi?: string;
}

interface Props {
  onResult?: (barcode: string) => Promise<any> | any;
  onClose?: () => void;
}

export default function BarkodScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lock = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScannedItem[]>([]);
  const [manualModal, setManualModal] = useState(false);

  // 1. Kameraları Listele
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((d) => {
        setDevices(d);
        const backCam = d.find(
          (device) =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('arka')
        );
        setDeviceId(backCam ? backCam.deviceId : d[0]?.deviceId || '');
      })
      .catch(() => setError('Kamera listesi alınamadı'));

    return () => stop();
  }, []);

  // 2. Kamera Seçimi Değiştiğinde Başlat
  useEffect(() => {
    if (deviceId) {
      start();
    }
  }, [deviceId]);

  const stop = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      readerRef.current?.reset();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
      setProcessing(false);
    }
  };

  const start = async () => {
    try {
      setError(null);
      if (!videoRef.current || !readerRef.current) return;

      stop(); // Önceki yayını kapat

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setScanning(true);

      await readerRef.current.decodeFromStream(
        stream,
        videoRef.current,
        async (res) => {
          if (!res || lock.current) return;

          const code = res.getText().trim();
          lock.current = true;
          setProcessing(true);
          
          // Geri bildirim
          if (navigator.vibrate) navigator.vibrate(100);

          try {
            // API çağrısı veya dışarıdan gelen onResult fonksiyonu
            await onResult?.(code);

            // Başarılı tarama sonrası listeye ekle
            setHistory((prev) => [
              {
                sku: code,
                yeniStok: Math.floor(Math.random() * 100) + 1,
                islemTarihi: new Date().toLocaleTimeString('tr-TR'),
              },
              ...prev,
            ]);
          } catch (err) {
            console.error('İşlem hatası:', err);
            setManualModal(true);
          } finally {
            // 1.5 saniye bekleme (çift okumayı önlemek için)
            setTimeout(() => {
              setProcessing(false);
              lock.current = false;
            }, 1500);
          }
        }
      );
    } catch (e) {
      console.error(e);
      setError('Kamera başlatılamadı. İzinleri kontrol edin.');
      setScanning(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto rounded-[32px] overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      
      {/* HEADER */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 bg-slate-900">
        <div>
          <h2 className="text-white font-black text-lg uppercase tracking-tight">Mobil Stok</h2>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <p className="text-slate-400 text-xs font-medium">{scanning ? 'Kamera Aktif' : 'Kamera Kapalı'}</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 text-white hover:bg-red-500/20 hover:text-red-500 transition-all flex items-center justify-center border border-white/10">
            ✕
          </button>
        )}
      </div>

      {/* CAMERA AREA */}
      <div className="relative w-full h-[340px] bg-black overflow-hidden group">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

        {/* DARK MASK (SVG) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <mask id="scanner-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect x="50%" y="50%" width="260" height="160" rx="24" fill="black" transform="translate(-130, -80)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#scanner-mask)" />
          </svg>
        </div>

        {/* SCANNING FRAME & ANIMATION */}
        <div className="absolute top-1/2 left-1/2 w-[260px] h-[160px] z-20 -translate-x-1/2 -translate-y-1/2">
          {/* Köşe Çizgileri */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-2xl" />
          
          {/* Tarama Çizgisi */}
          {scanning && !processing && (
            <div className="w-full h-[2px] bg-green-400/50 absolute top-0 animate-[scan_2s_linear_infinite] shadow-[0_0_15px_rgba(74,222,128,0.8)]" />
          )}
        </div>

        {/* PROCESSING OVERLAY */}
        {processing && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="flex flex-col items-center bg-white px-6 py-4 rounded-3xl shadow-xl">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-slate-900 font-bold text-sm tracking-wide">OKUNDU</span>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-red-950/90 p-6 text-center">
            <p className="text-white font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* CONTROLS & HISTORY */}
      <div className="p-5 bg-slate-900/50 space-y-4">
        <div className="flex gap-3">
          <select 
            value={deviceId} 
            onChange={(e) => setDeviceId(e.target.value)}
            className="flex-1 bg-slate-800 border border-white/10 text-white text-sm rounded-2xl px-4 h-12 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Kamera ${devices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>

          <button 
            onClick={() => setManualModal(true)}
            className="w-12 h-12 bg-slate-800 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            ⌨️
          </button>
        </div>

        {/* Geçmiş Listesi Bileşeni */}
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          <ScanHistoryList history={history} />
        </div>
      </div>

      {/* MODAL */}
      {manualModal && (
        <ManualProductModal 
          onClose={() => setManualModal(false)}
          onSubmit={(data) => {
            setHistory(prev => [{ sku: data.sku, yeniStok: data.stok, islemTarihi: 'Manuel' }, ...prev]);
            setManualModal(false);
          }}
        />
      )}

      {/* CSS Animasyon (Tailwind config'e eklemek yerine buraya ekleyebilirsin) */}
      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
