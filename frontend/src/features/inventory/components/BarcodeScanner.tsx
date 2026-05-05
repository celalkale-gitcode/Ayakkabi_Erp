'use client';
import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

interface Props {
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ onScan }: Props) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Tarayıcı ayarları
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 }, // Dikdörtgen barkodlar için ideal
      rememberLastUsedCamera: true,
      // Sadece arka kamerayı kullanmaya zorla (Mobil uyum için)
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    const scanner = new Html5QrcodeScanner("reader", config, false);
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Başarılı okuma
        onScan(decodedText);
        // Okuma sonrası kısa bir bip sesi veya titreşim istersen buraya ekleyebilirsin
      },
      (error) => {
        // Okuma hatalarını loglamıyoruz çünkü sürekli tarama yaptığı için çok fazla log birikir
      }
    );

    // Bileşen kapandığında kamerayı serbest bırak
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner temizleme hatası", err));
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-4 border-primary shadow-xl bg-black">
      <div id="reader" className="w-full"></div>
      <p className="text-center text-white text-xs py-2 bg-primary">
        Barkodu kutucuğun içine ortalayın
      </p>
    </div>
  );
}

