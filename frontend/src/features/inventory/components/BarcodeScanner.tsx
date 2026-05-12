'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function BarkodScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lock = useRef(false);

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

  useEffect(() => {
    if (scanning && deviceId) {
      start();
    }
  }, [deviceId]);

  const start = async () => {
    try {
      setError(null);

      if (!videoRef.current || !readerRef.current) return;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      setScanning(true);

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

      await videoRef.current.play();

      readerRef.current.decodeFromStream(
        stream,
        videoRef.current,
        (res) => {
          if (!res || lock.current) return;

          const code = res.getText().trim();

          lock.current = true;

          setLastCode(code);

          setProcessing(true);

          if (navigator.vibrate) {
            navigator.vibrate(100);
          }

          onResult(code);

          setTimeout(() => {
            setProcessing(false);
            lock.current = false;
          }, 2000);
        }
      );
    } catch (e) {
      setError('Kamera başlatılamadı');
      setScanning(false);
    }
  };

  const stop = () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());

      streamRef.current = null;

      if (readerRef.current) {
        (readerRef.current as any).reset?.();
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch {}

    setScanning(false);
    setProcessing(false);
    setLastCode(null);
  };

  return (
    <div
      style={{
        width: '92%',
        maxWidth: '320px',
        margin: '12px auto',
        background: '#111827',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid #334155',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
      }}
    >
      {/* BAŞLIK */}
      <div
        style={{
          height: '52px',
          padding: '0 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1e293b',
          background: '#0f172a',
        }}
      >
        <span
          style={{
            fontWeight: 800,
            color: '#fff',
            fontSize: '15px',
          }}
        >
          Barkod Tarayıcı
        </span>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: '#1e293b',
              color: '#cbd5e1',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* KAMERA ALANI */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '220px',
          backgroundColor: '#000',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
        />

        {/* MASKE */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <svg width="100%" height="100%">
            <defs>
              <mask id="m">
                <rect
                  width="100%"
                  height="100%"
                  fill="white"
                />

                <rect
                  x="50%"
                  y="50%"
                  width="220"
                  height="120"
                  rx="20"
                  fill="black"
                  transform="translate(-110, -60)"
                />
              </mask>
            </defs>

            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.6)"
              mask="url(#m)"
            />
          </svg>
        </div>

        {/* ÇERÇEVE */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '220px',
            height: '120px',
            zIndex: 10,
            pointerEvents: 'none',
            transform: 'translate(-110px, -60px)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '26px',
              height: '26px',
              borderTop: '5px solid white',
              borderLeft: '5px solid white',
              borderTopLeftRadius: '12px',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '26px',
              height: '26px',
              borderTop: '5px solid white',
              borderRight: '5px solid white',
              borderTopRightRadius: '12px',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '26px',
              height: '26px',
              borderBottom: '5px solid white',
              borderLeft: '5px solid white',
              borderBottomLeftRadius: '12px',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '26px',
              height: '26px',
              borderBottom: '5px solid white',
              borderRight: '5px solid white',
              borderBottomRightRadius: '12px',
            }}
          />

          {!processing && (
            <div
              className="scanner-line"
              style={{
                position: 'absolute',
                left: '10px',
                right: '10px',
                height: '2px',
                background: '#ff0000',
                boxShadow: '0 0 12px #ff0000',
              }}
            />
          )}
        </div>

        {/* İŞLENİYOR */}
        {processing && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 100,
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <div className="spinner"></div>

            <p
              style={{
                marginTop: '16px',
                fontWeight: 800,
                letterSpacing: '2px',
                fontSize: '14px',
              }}
            >
              İŞLENİYOR...
            </p>
          </div>
        )}
      </div>

      {/* ALT PANEL */}
      <div
        style={{
          padding: '16px',
          background: '#111827',
        }}
      >
        {/* BARKOD */}
        <div
          style={{
            height: '40px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: lastCode ? '#0f172a' : 'transparent',
            borderRadius: '10px',
            border: lastCode
              ? '1px solid #334155'
              : 'none',
          }}
        >
          {lastCode && (
            <span
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              Barkod:
              <span
                style={{
                  color: '#38bdf8',
                  marginLeft: '6px',
                }}
              >
                {lastCode}
              </span>
            </span>
          )}
        </div>

        {/* KAMERA SEÇ */}
        <select
          style={{
            width: '100%',
            height: '44px',
            padding: '0 12px',
            borderRadius: '10px',
            border: '1px solid #334155',
            marginBottom: '12px',
            outline: 'none',
            fontSize: '13px',
            fontWeight: 600,
            background: '#0f172a',
            color: '#fff',
          }}
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          {devices.map((d, index) => {
            const label = d.label.toLowerCase();

            return (
              <option
                key={d.deviceId}
                value={d.deviceId}
              >
                {label.includes('front') ||
                label.includes('user') ||
                label.includes('ön')
                  ? '📱 Ön Kamera'
                  : label.includes('back') ||
                    label.includes('rear') ||
                    label.includes('environment') ||
                    label.includes('arka')
                  ? '📷 Arka Kamera'
                  : `📷 Kamera ${index + 1}`}
              </option>
            );
          })}
        </select>

        {/* BUTON */}
        <button
          onClick={scanning ? stop : start}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '12px',
            fontWeight: 800,
            color: '#fff',
            border: 'none',
            background: scanning
              ? '#ef4444'
              : '#22c55e',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {scanning
            ? 'DURDUR'
            : 'KAMERAYI BAŞLAT'}
        </button>

        {error && (
          <p
            style={{
              color: '#f87171',
              marginTop: '10px',
              textAlign: 'center',
              fontSize: '13px',
            }}
          >
            {error}
          </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes scanMove {
          0% {
            top: 12%;
          }

          50% {
            top: 82%;
          }

          100% {
            top: 12%;
          }
        }

        .scanner-line {
          animation: scanMove 2s linear infinite;
        }

        .spinner {
          width: 42px;
          height: 42px;
          border: 4px solid rgba(255,255,255,0.2);
          border-top: 4px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
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
  );
}
