'use client';

import React, { useEffect, useRef, useState } from 'react';
import CameraButton from './CameraButton';
import FlashButton from './FlashButton';
import SwitchCameraButton from './SwitchCameraButton';

interface BarcodeScannerProps {
  onResult: (text: string) => void;
}

export default function BarcodeScanner({ onResult }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // State Yönetimleri
  const [flashOn, setFlashOn] = useState(false);
  const [activeCamera, setActiveCamera] = useState<'front' | 'back'>('back');
  
  // Güvenlik ve Kilit Mekanizmaları
  const isLocked = useRef<boolean>(false);
  const lastResult = useRef<string>(""); 
  const confirmationCount = useRef<number>(0);

  useEffect(() => {
    const loadScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/library');
        readerRef.current = new BrowserMultiFormatReader();
      } catch (err) {
        console.error("Scanner yüklenemedi:", err);
      }
    };
    loadScanner();

    return () => {
      if (readerRef.current) readerRef.current.reset();
    };
  }, []);

  // Flaş (Torch) Açma / Kapama Fonksiyonu
  const toggleFlash = async (turnOn: boolean) => {
    setFlashOn(turnOn);
    if (!videoRef.current || !scanning) return;
    
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      if (!stream) return;

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      const capabilities = videoTrack.getCapabilities() as any;
      
      if (capabilities && capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: turnOn }]
        } as any);
      } else {
        console.warn("Bu cihazda veya kamerada flaş (torch) desteği bulunamadı.");
      }
    } catch (err) {
      console.error("Flaş tetiklenirken hata oluştu:", err);
    }
  };

  // Kamera Değiştirme Fonksiyonu
  const changeCamera = async (camera: 'front' | 'back') => {
    setActiveCamera(camera);
    if (scanning) {
      if (readerRef.current) readerRef.current.reset();
      setFlashOn(false); 
      setTimeout(() => start(camera), 150);
    }
  };

  const start = async (cameraDirection = activeCamera) => {
    if (!videoRef.current || !readerRef.current) return;
    try {
      setScanning(true);
      setProcessing(false);
      isLocked.current = false;
      lastResult.current = "";
      confirmationCount.current = 0;

      const constraints = {
        video: { 
          facingMode: cameraDirection === "back" ? "environment" : "user",
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        }
      };

      await readerRef.current.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result: any) => {
          if (videoRef.current && flashOn) {
            toggleFlash(true);
          }

          if (result && !isLocked.current) {
            const currentText = result.getText();
            
            if (currentText === lastResult.current) {
              confirmationCount.current += 1;
            } else {
              lastResult.current = currentText;
              confirmationCount.current = 1;
              return; 
            }

            if (confirmationCount.current >= 3) {
              isLocked.current = true; 
              setProcessing(true); 

              if (navigator.vibrate) navigator.vibrate(100);
              onResult(currentText);

              setTimeout(() => {
                setProcessing(false);
                isLocked.current = false;
                lastResult.current = "";
                confirmationCount.current = 0;
              }, 2000);
            }
          }
        }
      );
    } catch (err) {
      console.error("Kamera başlatılamadı:", err);
      setScanning(false);
    }
  };

  const stop = () => {
    if (readerRef.current) readerRef.current.reset();
    setScanning(false);
    setFlashOn(false); 
    isLocked.current = false;
    lastResult.current = "";
    confirmationCount.current = 0;
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <style>{`
        @keyframes scanMove { 0% { top: 20%; } 50% { top: 80%; } 100% { top: 20%; } }
      `}</style>

      <div style={{ 
        position: 'relative', width: '100%', aspectRatio: '1.8', background: '#000', 
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden'
      }}>
        <video ref={videoRef} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* Köşe Çizgileri */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', width: '20px', height: '20px', borderTop: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)', borderRadius: '4px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '20px', height: '20px', borderTop: '2px solid rgba(255,255,255,0.3)', borderRight: '2px solid rgba(255,255,255,0.3)', borderRadius: '0 4px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '20px', height: '20px', borderBottom: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)', borderRadius: '0 0 0 4px' }} />
        <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '20px', height: '20px', borderBottom: '2px solid rgba(255,255,255,0.3)', borderRight: '2px solid rgba(255,255,255,0.3)', borderRadius: '0 0 4px 0' }} />

        {/* GÜNCEL MİLİMETRİK KONUMLANDIRMA PANELİ */}
        {!processing && (
          <>
            {/* SOL ÜST: FlashButton (Köşeden 1mm içeride) */}
            {scanning && (
              <div style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 30 }}>
                <FlashButton 
                  flashOn={flashOn} 
                  turnOn={() => toggleFlash(true)} 
                  turnOff={() => toggleFlash(false)} 
                />
              </div>
            )}

            {/* SAĞ ÜST: Kamera Değiştirme Butonu (Ana buton ile arasında tam 2mm (8px) mesafe var) */}
            {/* Matematik: 4px sağ kenar boşluğu + 34px ana buton eni + 8px ara boşluk = right: 46px */}
            <div style={{ position: 'absolute', top: '4px', right: '46px', zIndex: 30 }}>
              <SwitchCameraButton 
                activeCamera={activeCamera} 
                onCameraChange={changeCamera} 
              />
            </div>

            {/* SAĞ ÜST: Ana Kamera Aç/Kapat Butonu (Köşeden 1mm içeride) */}
            <div style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 30 }}>
              <CameraButton scanning={scanning} start={() => start()} stop={stop} />
            </div>
          </>
        )}

        {/* Lazer */}
        {scanning && !processing && (
          <div style={{ 
            position: 'absolute', left: '12%', right: '12%', height: '1px', background: 'rgba(255, 0, 0, 0.35)',
            boxShadow: '0 0 8px 1px rgba(255, 0, 0, 0.35)', zIndex: 10, animation: 'scanMove 2.5s ease-in-out infinite' 
          }} />
        )}

        {/* İşleniyor Ekranı */}
        {processing && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600', letterSpacing: '2px' }}>İŞLENİYOR</span>
              <div style={{ width: '30px', height: '2px', background: '#ff0000' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
