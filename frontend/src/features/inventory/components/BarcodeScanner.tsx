'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { BrowserMultiFormatReader } from '@zxing/browser';

import ScanHistoryList from './ScanHistoryList';
import ManualProductModal from './ManualProductModal';

interface ScannedItem {
  sku: string;
  yeniStok: number;
  islemTarihi?: string;
}

interface Props {
  onResult?: (
    barcode: string,
  ) => Promise<any> | any;

  onClose?: () => void;
}

export default function BarkodScanner({
  onResult,
  onClose,
}: Props) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const readerRef =
    useRef<BrowserMultiFormatReader | null>(
      null,
    );

  const streamRef =
    useRef<MediaStream | null>(null);

  const lock = useRef(false);

  const [scanning, setScanning] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [devices, setDevices] = useState<
    MediaDeviceInfo[]
  >([]);

  const [deviceId, setDeviceId] =
    useState('');

  const [lastCode, setLastCode] =
    useState<string | null>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  const [history, setHistory] = useState<
    ScannedItem[]
  >([]);

  const [manualModal, setManualModal] =
    useState(false);

  useEffect(() => {
    readerRef.current =
      new BrowserMultiFormatReader();

    BrowserMultiFormatReader
      .listVideoInputDevices()
      .then((d) => {
        setDevices(d);

        const backCam = d.find(
          (device) =>
            device.label
              .toLowerCase()
              .includes('back') ||
            device.label
              .toLowerCase()
              .includes('arka'),
        );

        setDeviceId(
          backCam
            ? backCam.deviceId
            : d[0]?.deviceId || '',
        );
      })
      .catch(() =>
        setError(
          'Kamera listesi alınamadı',
        ),
      );

    return () => stop();
  }, []);

  useEffect(() => {
    if (scanning && deviceId) {
      start();
    }
  }, [deviceId]);

  const start = async () => {
    try {
      setError(null);

      if (
        !videoRef.current ||
        !readerRef.current
      ) {
        return;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((t) => t.stop());
      }

      setScanning(true);

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              deviceId: deviceId
                ? {
                    exact: deviceId,
                  }
                : undefined,

              width: {
                ideal: 1280,
              },

              height: {
                ideal: 720,
              },

              facingMode:
                'environment',
            },
          },
        );

      streamRef.current = stream;

      videoRef.current.srcObject =
        stream;

      await videoRef.current.play();

      readerRef.current.decodeFromStream(
        stream,
        videoRef.current,
        async (res) => {
          if (!res || lock.current)
            return;

          const code = res
            .getText()
            .trim();

          lock.current = true;

          setLastCode(code);

          setProcessing(true);

          navigator.vibrate?.(100);

          try {
            await onResult?.(code);

            setHistory((prev) => [
              {
                sku: code,

                yeniStok:
                  Math.floor(
                    Math.random() * 100,
                  ) + 1,

                islemTarihi:
                  new Date().toISOString(),
              },

              ...prev,
            ]);
          } catch (err) {
            console.error(err);

            setManualModal(true);
          }

          setTimeout(() => {
            setProcessing(false);

            lock.current = false;
          }, 1500);
        },
      );
    } catch (e) {
      console.error(e);

      setError(
        'Kamera başlatılamadı',
      );

      setScanning(false);
    }
  };

  const stop = () => {
    try {
      streamRef.current
        ?.getTracks()
        .forEach((t) => t.stop());

      streamRef.current = null;

      // @ts-ignore
      readerRef.current?.reset?.();

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }
    } catch {}

    setScanning(false);

    setProcessing(false);
  };

  return (
    <>
      <div className="w-full max-w-[420px] mx-auto rounded-[32px] overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">

        {/* HEADER */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 bg-slate-900">

          <div>
            <h2 className="text-white font-black text-lg">
              Mobil Stok Sayım
            </h2>

            <p className="text-slate-400 text-xs mt-0.5">
              Barkod Tarama Sistemi
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="
                w-9 h-9 rounded-full
                bg-white/10
                text-white
                hover:bg-red-500
                transition
              "
            >
              ✕
            </button>
          )}
        </div>

        {/* CAMERA AREA */}
        <div className="relative w-full h-[320px] bg-black overflow-hidden">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="
              absolute inset-0
              w-full h-full
              object-cover
              z-[1]
            "
          />

          {/* DARK MASK */}
          <div className="absolute inset-0 z-[5] pointer-events-none">

            <svg
              width="100%"
              height="100%"
            >
              <defs>
                <mask id="scanner-mask">
                  <rect
                    width="100%"
                    height="100%"
                    fill="white"
                  />

                  <rect
                    x="50%"
                    y="50%"
                    width="260"
                    height="150"
                    rx="24"
                    fill="black"
                    transform="translate(-130,-75)"
                  />
                </mask>
              </defs>

              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.65)"
                mask="url(#scanner-mask)"
              />
            </svg>
          </div>

          {/* FRAME */}
          <div
            className="
              absolute
              top-1/2
              left-1/2
              w-[260px]
              h-[150px]
              z-10
              -translate-x-1/2
              -translate-y-1/2
            "
          >

            {/* LEFT TOP */}
            <div
              className="
                absolute top-0 left-0
                w-8 h-8
                border-t-[6px]
                border-l-[6px]
                border-green-400
                rounded-tl-2xl
              "
            />

            {/* RIGHT TOP */}
            <div
              className="
                absolute top-0 right-0
                w-8 h-8
                border-t-[6px]
                border-r-[6px]
                border-green-400
                rounded-tr-2xl
              "
            />

            {/* LEFT BOTTOM */}
            <div
              className="
                absolute bottom-0 left-0
                w-8 h-8
                border-b-[6px]
                border-l-[6px]
                border-green-400
                rounded-bl-2xl
              "
            />

            {/* RIGHT BOTTOM */}
            <div
              className="
                absolute bottom-0 right-0
                w-8 h-8
                border-b-[6px]
                border-r-[6px]
                border-green-400
                rounded-br-2xl
              "
            />

            {!processing && (
              <div
                className="scanner-line"
                style={{
                  position: 'absolute',
                  left: '12px',
                  right: '12px',
                  height: '3px',
                  background:
                    '#22c55e',
                  boxShadow:
                    '0 0 20px #22c55e',
                }}
              />
            )}
          </div>

          {/* PROCESSING */}
          {processing && (
            <div
              className="
                absolute inset-0 z-[100]
                bg-slate-950/90
                flex flex-col
                items-center
                justify-center
                text-white
              "
            >
              <div className="spinner" />

              <p
                className="
                  mt-5
                  font-black
                  tracking-[4px]
                  text-sm
                "
              >
                İŞLENİYOR...
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM PANEL */}
        <div className="p-4 bg-slate-900 space-y-4">

          {/* OKUNAN BARKOD */}
          <div
            className="
              bg-slate-800
              rounded-2xl
              border border-white/5
              p-4
            "
          >
            <p
              className="
                text-slate-400
                text-xs
                font-bold
                uppercase
                tracking-wider
              "
            >
              Okunan Barkod :
            </p>

            <div
              className="
                mt-2
                text-green-400
                text-xl
                font-black
                break-all
                min-h-[28px]
              "
            >
              {lastCode || '-'}
            </div>
          </div>

          {/* CAMERA SELECT */}
          <select
            className="
              w-full
              h-14
              rounded-2xl
              bg-slate-800
              border border-white/5
              px-4
              text-white
              font-semibold
              outline-none
            "
            value={deviceId}
            onChange={(e) =>
              setDeviceId(
                e.target.value,
              )
            }
          >
            {devices.map((d, index) => {
              const label =
                d.label.toLowerCase();

              return (
                <option
                  key={d.deviceId}
                  value={d.deviceId}
                >
                  {label.includes(
                    'front',
                  ) ||
                  label.includes(
                    'user',
                  ) ||
                  label.includes('ön')
                    ? '📱 Ön Kamera'
                    : label.includes(
                          'back',
                        ) ||
                        label.includes(
                          'rear',
                        ) ||
                        label.includes(
                          'environment',
                        ) ||
                        label.includes(
                          'arka',
                        )
                      ? '📷 Arka Kamera'
                      : `📷 Kamera ${
                          index + 1
                        }`}
                </option>
              );
            })}
          </select>

          {/* BUTTON */}
          <button
            onClick={
              scanning ? stop : start
            }
            className={`
              w-full
              h-14
              rounded-2xl
              font-black
              text-white
              transition-all
              active:scale-[0.98]
              ${
                scanning
                  ? 'bg-red-500'
                  : 'bg-green-500'
              }
            `}
          >
            {scanning
              ? 'TARAMAYI DURDUR'
              : 'KAMERAYI BAŞLAT'}
          </button>

          {/* SON TARANANLAR */}
          <div
            className="
              rounded-2xl
              overflow-hidden
            "
          >
            <ScanHistoryList
              items={history}
            />
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="
                text-red-400
                text-sm
                text-center
                pt-1
              "
            >
              {error}
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes scanMove {
            0% {
              top: 15%;
            }

            50% {
              top: 85%;
            }

            100% {
              top: 15%;
            }
          }

          .scanner-line {
            animation: scanMove 2s linear infinite;
          }

          .spinner {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            border: 5px solid
              rgba(255, 255, 255, 0.2);

            border-top: 5px solid
              white;

            animation: spin 1s linear
              infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }

            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>

      {/* MANUAL PRODUCT MODAL */}
      {manualModal && lastCode && (
        <ManualProductModal
          barkod={lastCode}
          onClose={() =>
            setManualModal(false)
          }
          onSubmit={(data) => {
            console.log(data);

            setManualModal(false);
          }}
        />
      )}
    </>
  );
}
