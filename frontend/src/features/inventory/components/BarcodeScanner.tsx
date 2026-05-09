'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  BrowserMultiFormatReader,
} from '@zxing/browser';

interface BarkodScannerProps {
  onResult: (
    barkod: string,
  ) => void;

  onClose?: () => void;
}

export default function BarkodScanner({
  onResult,
  onClose,
}: BarkodScannerProps) {

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const codeReader =
    useRef(
      new BrowserMultiFormatReader(),
    );

  const [cameras, setCameras] =
    useState<MediaDeviceInfo[]>([]);

  const [
    selectedCamera,
    setSelectedCamera,
  ] = useState('');

  const [isScanning, setIsScanning] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // Duplicate scan lock
  const lastScanRef =
    useRef<string | null>(null);

  const scanLockRef =
    useRef(false);

  // Kamera listele
  useEffect(() => {

    BrowserMultiFormatReader
      .listVideoInputDevices()

      .then((devices) => {

        const videoDevices =
          devices.filter(
            (d) =>
              d.kind ===
              'videoinput',
          );

        setCameras(videoDevices);

        if (
          videoDevices.length > 0
        ) {

          // Önce arka kamera bul
          const backCamera =
            videoDevices.find(
              (d) =>
                d.label
                  .toLowerCase()
                  .includes(
                    'back',
                  ) ||
                d.label
                  .toLowerCase()
                  .includes(
                    'rear',
                  ),
            );

          setSelectedCamera(
            backCamera
              ?.deviceId ||
              videoDevices[0]
                .deviceId,
          );
        }
      })

      .catch(() => {

        setError(
          'Kamera erişimi alınamadı.',
        );
      });

  }, []);

  // Tarama başlat
  const taramayiBaslat =
    async () => {

      if (
        !selectedCamera ||
        !videoRef.current
      ) {
        return;
      }

      setError(null);

      setIsScanning(true);

      try {

        await codeReader.current
          .decodeFromVideoDevice(

            selectedCamera,

            videoRef.current,

            (result) => {

              if (!result) return;

              const barkod =
                result.getText();

              // Lock aktifse ignore
              if (
                scanLockRef.current
              ) {
                return;
              }

              // Aynı barkod tekrar
              if (
                lastScanRef.current ===
                barkod
              ) {
                return;
              }

              // SADECE EAN13
              if (
                !/^\d{13}$/.test(
                  barkod,
                )
              ) {
                return;
              }

              scanLockRef.current =
                true;

              lastScanRef.current =
                barkod;

              if (
                typeof navigator !==
                  'undefined' &&
                navigator.vibrate
              ) {

                navigator.vibrate(
                  120,
                );
              }

              onResult(barkod);

              setTimeout(() => {

                scanLockRef.current =
                  false;

                lastScanRef.current =
                  null;

              }, 1500);
            },
          );

      } catch (err) {

        console.error(err);

        setError(
          'Tarayıcı başlatılamadı.',
        );

        setIsScanning(false);
      }
    };

  // Tarama durdur
  const taramayiDurdur =
    () => {

      if (
        videoRef.current
          ?.srcObject
      ) {

        const stream =
          videoRef.current
            .srcObject as MediaStream;

        stream
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );
      }

      setIsScanning(false);
    };

  // Cleanup
  useEffect(() => {

    return () => {

      if (
        videoRef.current
          ?.srcObject
      ) {

        const stream =
          videoRef.current
            .srcObject as MediaStream;

        stream
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );
      }
    };

  }, []);

  return (

    <div className="w-full flex justify-center">

      <div
        className="
          w-full
          max-w-sm
          bg-white
          rounded-3xl
          border
          border-slate-200
          shadow-2xl
          overflow-hidden
        "
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">

          <div>

            <h3 className="font-bold text-slate-800">
              Barkod Tarama
            </h3>

            <p className="text-xs text-slate-500">
              Barkodu çerçeve içine hizalayın
            </p>

          </div>

          {onClose && (

            <button
              onClick={onClose}
              className="
                w-8 h-8
                rounded-full
                bg-slate-100
                hover:bg-red-100
                text-slate-500
                hover:text-red-600
                transition
              "
            >
              ✕
            </button>
          )}

        </div>

        {/* CAMERA SELECT */}
        <div className="p-4 pb-2">

          <select
            value={selectedCamera}
            onChange={(e) =>
              setSelectedCamera(
                e.target.value,
              )
            }
            className="
              w-full
              border
              rounded-xl
              px-3
              py-2
              text-sm
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >

            {cameras.map((d) => (

              <option
                key={d.deviceId}
                value={d.deviceId}
              >
                {d.label ||
                  'Kamera'}
              </option>

            ))}

          </select>

        </div>

        {/* CAMERA AREA */}
        <div className="px-4 pb-4">

          <div
            className="
              relative
              w-full
              h-[340px]
              rounded-2xl
              overflow-hidden
              bg-black
              border
              border-slate-200
            "
          >

            {/* VIDEO */}
            <video
              ref={videoRef}
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
              "
            />

            {/* DARK AREA */}
            <div className="absolute inset-0 bg-black/55" />

            {/* ACTIVE SCAN FRAME */}
            <div
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2

                w-[260px]
                h-[140px]

                rounded-2xl
                overflow-hidden

                border-[3px]
                border-cyan-400

                shadow-[0_0_35px_rgba(34,211,238,0.95)]
              "
            >

              {/* INSIDE BRIGHT AREA */}
              <div
                className="
                  absolute
                  inset-0
                  bg-transparent
                  backdrop-brightness-150
                "
              />

              {/* SCAN LINE */}
              <div
                className="
                  absolute
                  left-0
                  top-0

                  w-full
                  h-[2px]

                  bg-red-500

                  shadow-[0_0_15px_red]

                  animate-[scanline_2.2s_linear_infinite]
                "
              />

            </div>

            {/* CORNERS */}
            <div className="absolute left-[calc(50%-130px)] top-[calc(50%-70px)] w-6 h-6 border-l-4 border-t-4 border-cyan-300 rounded-tl-xl" />

            <div className="absolute right-[calc(50%-130px)] top-[calc(50%-70px)] w-6 h-6 border-r-4 border-t-4 border-cyan-300 rounded-tr-xl" />

            <div className="absolute left-[calc(50%-130px)] bottom-[calc(50%-70px)] w-6 h-6 border-l-4 border-b-4 border-cyan-300 rounded-bl-xl" />

            <div className="absolute right-[calc(50%-130px)] bottom-[calc(50%-70px)] w-6 h-6 border-r-4 border-b-4 border-cyan-300 rounded-br-xl" />

          </div>

        </div>

        {/* BUTTON */}
        <div className="px-4 pb-4">

          <button
            onClick={
              isScanning
                ? taramayiDurdur
                : taramayiBaslat
            }
            className={`
              w-full
              py-3
              rounded-2xl
              font-bold
              transition-all
              duration-300

              ${
                isScanning
                  ? `
                    bg-red-50
                    text-red-600
                    hover:bg-red-100
                  `
                  : `
                    bg-blue-600
                    text-white
                    hover:bg-blue-700
                    shadow-lg
                    shadow-blue-200
                  `
              }
            `}
          >

            {isScanning
              ? 'Taramayı Durdur'
              : 'Kamerayı Aç'}

          </button>

          {error && (

            <p className="text-red-500 text-xs mt-3 text-center">
              {error}
            </p>
          )}

        </div>

        {/* STYLE */}
        <style jsx>{`
          @keyframes scanline {

            0% {
              top: 0;
            }

            50% {
              top: calc(100% - 2px);
            }

            100% {
              top: 0;
            }
          }
        `}</style>

      </div>

    </div>
  );
}
