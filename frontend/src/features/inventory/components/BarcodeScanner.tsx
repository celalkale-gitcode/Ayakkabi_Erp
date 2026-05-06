'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

interface Props {
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ onScan }: Props) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    const scanner = new Html5QrcodeScanner("reader", config, false);
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      () => {}
    );

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-sm mx-auto bg-black rounded-xl overflow-hidden">
      <div id="reader" className="w-full min-h-[250px]" />
      <p className="text-center text-white text-xs py-2 bg-blue-600">
        Barkodu ortalayın
      </p>
    </div>
  );
}
