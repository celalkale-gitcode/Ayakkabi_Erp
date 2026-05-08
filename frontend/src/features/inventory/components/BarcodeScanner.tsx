'use client';

import {
  useEffect,
  useRef,
} from 'react';

import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
} from 'html5-qrcode';

interface Props {
  onScan: (
    barcode: string,
  ) => void;
}

// EAN13 doğrulama
function isValidEAN13(
  barcode: string,
) {

  // 13 hane olmalı
  if (
    !/^\d{13}$/.test(
      barcode,
    )
  ) {
    return false;
  }

  const digits =
    barcode
      .split('')
      .map(Number);

  const checkDigit =
    digits[12];

  let sum = 0;

  for (
    let i = 0;
    i < 12;
    i++
  ) {

    sum +=
      i % 2 === 0
        ? digits[i]
        : digits[i] * 3;
  }

  const calculated =
    (10 - (sum % 10)) % 10;

  return (
    calculated ===
    checkDigit
  );
}

export default function BarcodeScanner({
  onScan,
}: Props) {

  const scannerRef =
    useRef<Html5QrcodeScanner | null>(
      null,
    );

  const lastScannedRef =
    useRef<string | null>(
      null,
    );

  const scanLockRef =
    useRef(false);

  useEffect(() => {

    const config = {

      fps: 5,

      qrbox: {
        width: 280,
        height: 160,
      },

      rememberLastUsedCamera: true,

      supportedScanTypes: [
        Html5QrcodeScanType
          .SCAN_TYPE_CAMERA,
      ],

      formatsToSupport: [
        7, // EAN_13
      ],
    };

    const scanner =
      new Html5QrcodeScanner(
        'reader',
        config,
        false,
      );

    scannerRef.current =
      scanner;

    scanner.render(

      async (
        decodedText,
      ) => {

        // Lock aktifse ignore
        if (
          scanLockRef.current
        ) {
          return;
        }

        // Aynı barkod tekrar
        if (
          lastScannedRef.current ===
          decodedText
        ) {
          return;
        }

        // EAN13 validasyonu
        if (
          !isValidEAN13(
            decodedText,
          )
        ) {

          console.warn(
            'Geçersiz EAN13:',
            decodedText,
          );

          return;
        }

        scanLockRef.current =
          true;

        lastScannedRef.current =
          decodedText;

        try {

          await onScan(
            decodedText,
          );

          if (
            typeof navigator !==
              'undefined' &&
            navigator.vibrate
          ) {

            navigator.vibrate(
              80,
            );
          }

        } finally {

          setTimeout(() => {

            scanLockRef.current =
              false;

            lastScannedRef.current =
              null;

          }, 1500);
        }
      },

      () => {},
    );

    return () => {

      scannerRef.current
        ?.clear()
        .catch(() => {});
    };
  }, [onScan]);

  return (

    <div className="w-full max-w-sm mx-auto bg-black rounded-2xl overflow-hidden shadow-lg border">

      <div
        id="reader"
        className="w-full min-h-[280px]"
      />

      <div className="bg-blue-600 text-white text-center text-xs py-2 font-medium">
        EAN13 Barkodu Kameraya Gösterin
      </div>
    </div>
  );
}
