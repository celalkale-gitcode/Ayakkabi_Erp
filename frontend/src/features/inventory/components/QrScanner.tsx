import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

// QR koddan çözülecek standart şemamız
interface QrJsonStructure {
  t: 'P' | 'L' | 'U'; // TİP -> P: Product, L: Location, U: User
  v: number;          // VERSİYON
  s: string;          // SKU / ÜRÜN KODU
  b: string;          // BARKOD (EAN-13)
}

// Tarama sonucu üst bileşene fırlatılacak temizlenmiş veri tipi
export interface ScanResultData {
  isMetadata: boolean;
  type: 'P' | 'L' | 'U' | 'RAW'; // RAW: Klasik çizgisel barkod veya düz metin
  sku?: string;
  barcode: string;
}

interface QrScannerProps {
  onScanSuccess: (data: ScanResultData) => void;
  onScanError?: (error: any) => void;
  isActive?: boolean;
}

const QrScanner: React.FC<QrScannerProps> = ({
  onScanSuccess,
  onScanError,
  isActive = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Başarılı okumalarda personeli uyarmak için ses ve titreşim tetikleyicileri
  const triggerFeedback = () => {
    if (navigator.vibrate) navigator.vibrate(100); // 100ms titreşim
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // Bip sesi frekansı
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.08); // 80ms ses süresi
  };

  // Okunan ham metni (raw text) analiz eden fonksiyon
  const processRawText = (text: string) => {
    triggerFeedback();

    try {
      // 1. Gelen metin bizim bastığımız akıllı QR JSON'ı mı? Kontrol et.
      const parsed: QrJsonStructure = JSON.parse(text);

      if (parsed.t && parsed.s && parsed.b) {
        // Yapısal QR Metadata çözüldü
        onScanSuccess({
          isMetadata: true,
          type: parsed.t,
          sku: parsed.s,
          barcode: parsed.b,
        });
        return;
      }
    } catch (e) {
      // JSON parse başarısız olduysa bu düz bir EAN-13, Code 128 veya harici bir koddur.
    }

    // 2. Eğer JSON değilse düz barkod (Raw) olarak kabul et
    onScanSuccess({
      isMetadata: false,
      type: 'RAW',
      barcode: text, // Ham veri direkt barkod alanına yazılır
    });
  };

  useEffect(() => {
    if (!isActive) {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      return;
    }

    // ZXing Reader örneğini oluştur (Hem 1D barkodları hem 2D Karekodları aynı anda okur)
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    // Kamera izinlerini ve cihaz listesini kontrol eterek başlat
    codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length === 0) {
          setHasPermission(false);
          return;
        }

        setHasPermission(true);

        // Mobil cihazlarda genellikle arkadaki ana kamerayı (environment) seçmek için:
        const backCamera = videoInputDevices.find((device) =>
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('ark') ||
          device.label.toLowerCase().includes('environment')
        );

        const selectedCameraId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

        // Sürekli tarama modunu başlat (decodeFromVideoDevice)
        codeReader.decodeFromVideoDevice(
          selectedCameraId,
          videoRef.current,
          (result: Result | null, err: any) => {
            if (result) {
              processRawText(result.getText());
              
              // Üst üste mükerrer okumayı engellemek için taramayı 1 saniye duraklatıp açıyoruz
              codeReader.reset();
              setTimeout(() => {
                if (isActive && codeReaderRef.current) {
                  codeReader.decodeFromVideoDevice(selectedCameraId, videoRef.current, this as any);
                }
              }, 1200);
            }
            if (err && onScanError && !(err.name === 'NotFoundException')) {
              // NotFoundException her karede kod bulamadığında fırlatılır, bunu yutuyoruz.
              onScanError(err);
            }
          }
        );
      })
      .catch((err) => {
        setHasPermission(false);
        console.error('Kamera başlatılamadı:', err);
      });

    // Component unmount olduğunda veya pasife çekildiğinde kamerayı kapat ve belleği temizle
    return () => {
      codeReader.reset();
    };
  }, [isActive]);

  if (hasPermission === false) {
    return <div style={{ color: 'red', padding: '10px' }}>Kamera izni reddedildi veya kamera bulunamadı.</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      {/* Kamera Görünümü Container'ı */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '75%', // 4:3 Aspect Ratio koruması
        backgroundColor: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }}>
        <video
          ref={videoRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Depo Personeli İçin Hedefleme Kılavuz Çizgileri (UX) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-25%, -25%)',
          width: '50%',
          height: '50%',
          border: '2px dashed #00ff00',
          borderRadius: '8px',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        }} />
      </div>
      
      {isActive && (
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: '#666' }}>
          Kodu yeşil alanın içine hizalayın.
        </div>
      )}
    </div>
  );
};

export default QrScanner;
