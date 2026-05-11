'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

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

export default function BarcodeScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lock = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]); // Varsayılan boş dizi
  const [deviceId, setDeviceId] = useState('');
  const [lastCode, setLastCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScannedItem[]>([]);
  const [manualModal, setManualModal] = useState(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    
    // Tarayıcı ortamında olup olmadığımızı kontrol et
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      BrowserMultiFormatReader.listVideoInputDevices()
        .then((d) => {
          const deviceList = d || [];
          setDevices(deviceList);
          
          const backCam = deviceList.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('arka')
          );
          
          if (backCam) {
            setDeviceId(backCam.deviceId);
          } else if (deviceList.length > 0) {
            setDeviceId(deviceList[0].deviceId);
          }
        })
        .catch(() => setError('Kamera listesi alınamadı'));
    }

    return () => stop();
  }, []);

  useEffect(() => {
    if (deviceId && !scanning) start();
  }, [deviceId]);

  const stop = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (readerRef.current) (readerRef.current as any).reset?.();
      if (videoRef.current) videoRef.current.srcObject = null;
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
      stop();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId ? { exact: deviceId } : undefined, facingMode: 'environment' }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setScanning(true);
      await readerRef.current.decodeFromStream(stream, videoRef.current, async (res) => {
        if (!res || lock.current) return;
        const code = res.getText().trim();
        lock.current = true;
        setLastCode(code);
        setProcessing(true);
        navigator.vibrate?.(100);
        try {
          await onResult?.(code);
          setHistory(prev => [{ sku: code, yeniStok: Math.floor(Math.random()*100)+1, islemTarihi: new Date().toLocaleTimeString() }, ...prev]);
        } catch {
          setManualModal(true);
        } finally {
          setTimeout(() => { lock.current = false; setProcessing(false); }, 1500);
        }
      });
    } catch {
      setError('Kamera başlatılamadı');
      setScanning(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto rounded-[32px] overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl text-white">
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 bg-slate-900">
        <h2 className="font-black text-lg uppercase">Mobil Stok</h2>
        {onClose && <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10">✕</button>}
      </div>

      <div className="relative w-full h-[320px] bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="w-[260px] h-[160px] border-2 border-green-400/50 rounded-2xl relative">
             <div className="absolute inset-0 border-4 border-green-400 rounded-2xl opacity-50" />
          </div>
        </div>
        {processing && <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm font-bold">OKUNDU...</div>}
      </div>

      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          {/* MAP HATASINI ÇÖZEN GÜVENLİ KONTROL: */}
          <select 
            value={deviceId} 
            onChange={e => setDeviceId(e.target.value)} 
            className="flex-1 bg-slate-800 p-3 rounded-xl border border-white/10 outline-none text-sm"
          >
            <option value="">Kamera Seçin</option>
            {devices && devices.length > 0 ? (
              devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Kamera ${devices.indexOf(d) + 1}`}
                </option>
              ))
            ) : null}
          </select>
          
          <button onClick={() => setManualModal(true)} className="px-4 bg-slate-800 rounded-xl border border-white/10">⌨️</button>
        </div>

        <div className="max-h-[200px] overflow-y-auto">
          <ScanHistoryList {...({ history } as any)} />
        </div>
      </div>

      {manualModal && (
        <ManualProductModal 
          barkod={lastCode}
          onClose={() => setManualModal(false)}
          onSubmit={(data: any) => {
            setHistory(prev => [{ sku: data.sku || lastCode, yeniStok: data.stok, islemTarihi: 'Manuel' }, ...prev]);
            setManualModal(false);
          }}
        />
      )}
    </div>
  );
}
