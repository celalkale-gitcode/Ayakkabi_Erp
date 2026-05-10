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

  // INIT
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((cams) => {
        setDevices(cams);

        // Öncelik arka kamera
        const backCam = cams.find((d) => {
          const label = d.label.toLowerCase();

          return (
            label.includes('back') ||
            label.includes('rear') ||
            label.includes('environment') ||
            label.includes('arka')
          );
        });

        setDeviceId(
          backCam?.deviceId ||
            cams?.[0]?.deviceId ||
            ''
        );
      })
      .catch(() => {
        setError('Kamera listesi alınamadı');
      });

    return () => stop();
  }, []);

  // Kamera değişince restart
  useEffect(() => {
    if (scanning && deviceId) {
      start();
    }
  }, [deviceId]);

  // START
  const start = async () => {
    try {
      setError(null);

      if (!videoRef.current || !readerRef.current) {
        return;
      }

      stop();

      setScanning(true);

      // Önce eski stream kapat
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((t) => t.stop());
      }

      // Kamera aç
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: deviceId
              ? { exact: deviceId }
              : undefined,

            facingMode: {
              ideal: 'environment',
            },

            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },
          },

          audio: false,
        });

      streamRef.current = stream;

      videoRef.current.srcObject = stream;

      await videoRef.current.play();

      // Barkod oku
      readerRef.current.decodeFromStream(
        stream,
        videoRef.current,
        (result) => {
          if (!result) return;

          if (lock.current) return;

          const code =
            result.getText().trim();

          if (!code) return;

          lock.current = true;

          setProcessing(true);

          setLastCode(code);

          // titreşim
          navigator.vibrate?.(120);

          // beep
          try {
            const ctx = new AudioContext();

            const osc =
              ctx.createOscillator();

            osc.frequency.value = 850;

            osc.connect(ctx.destination);

            osc.start();

            osc.stop(
              ctx.currentTime + 0.08
            );
          } catch {}

          onResult(code);

          setTimeout(() => {
            setProcessing(false);

            lock.current = false;
          }, 1800);
        }
      );
    } catch (err) {
      console.error(err);

      setError(
        'Kamera başlatılamadı'
      );

      setScanning(false);
    }
  };

  // STOP
  const stop = () => {
    try {
      streamRef.current
        ?.getTracks()
        .forEach((t) => t.stop());

      streamRef.current = null;

      // TS SAFE RESET
      if (
        readerRef.current &&
        'reset' in readerRef.current
      ) {
        (
          readerRef.current as any
        ).reset();
      }

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }
    } catch {}

    setScanning(false);

    setProcessing(false);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '390px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '32px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow:
          '0 20px 60px rgba(0,0,0,0.15)',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: '64px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom:
            '1px solid #f1f5f9',
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 800,
              color: '#0f172a',
            }}
          >
            AI Barkod Scanner
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#64748b',
              marginTop: '2px',
            }}
          >
            Akıllı tarama sistemi
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: '#f1f5f9',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* CAMERA */}
      <div
        style={{
          padding: '16px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '360px',
            borderRadius: '28px',
            overflow: 'hidden',
            background: '#000',
          }}
        >
          {/* VIDEO */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* MASK */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'rgba(0,0,0,0.55)',
              zIndex: 2,
            }}
          />

          {/* CENTER CUT */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '260px',
              height: '150px',
              transform:
                'translate(-50%, -50%)',
              zIndex: 5,
              boxShadow:
                '0 0 0 9999px rgba(0,0,0,0.55)',
              borderRadius: '24px',
            }}
          />

          {/* FRAME */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '260px',
              height: '150px',
              transform:
                'translate(-50%, -50%)',
              zIndex: 20,
              border:
                '4px solid #22d3ee',
              borderRadius: '24px',
              boxShadow:
                '0 0 30px rgba(34,211,238,0.9)',
            }}
          >
            {/* scan line */}
            {!processing && (
              <div
                className="scan-line"
                style={{
                  position: 'absolute',
                  left: '10px',
                  right: '10px',
                  height: '3px',
                  background: '#ff0000',
                  boxShadow:
                    '0 0 14px red',
                }}
              />
            )}

            {/* corners */}
            <div className="corner tl" />
            <div className="corner tr" />
            <div className="corner bl" />
            <div className="corner br" />
          </div>

          {/* PROCESSING */}
          {processing && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 100,
                background:
                  'rgba(15,23,42,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div className="spinner" />

              <div
                style={{
                  marginTop: '18px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                }}
              >
                İŞLENİYOR...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM */}
      <div
        style={{
          padding: '20px',
        }}
      >
        {/* LAST CODE */}
        <div
          style={{
            height: '50px',
            borderRadius: '14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {lastCode
            ? `Barkod: ${lastCode}`
            : 'Henüz barkod okunmadı'}
        </div>

        {/* CAMERA SELECT */}
        <select
          value={deviceId}
          onChange={(e) =>
            setDeviceId(e.target.value)
          }
          style={{
            width: '100%',
            height: '50px',
            borderRadius: '14px',
            border: '2px solid #e2e8f0',
            padding: '0 14px',
            marginBottom: '14px',
            fontWeight: 700,
            outline: 'none',
          }}
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
                  'front'
                ) ||
                label.includes(
                  'user'
                ) ||
                label.includes('ön')
                  ? '📱 Ön Kamera'
                  : label.includes(
                        'back'
                      ) ||
                      label.includes(
                        'rear'
                      ) ||
                      label.includes(
                        'environment'
                      ) ||
                      label.includes(
                        'arka'
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
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '18px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '15px',
            color: '#fff',
            background: scanning
              ? '#ef4444'
              : '#2563eb',
          }}
        >
          {scanning
            ? 'TARAMAYI DURDUR'
            : 'KAMERAYI BAŞLAT'}
        </button>

        {error && (
          <div
            style={{
              marginTop: '12px',
              color: '#ef4444',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* STYLE */}
      <style jsx global>{`
        @keyframes scanMove {
          0% {
            top: 10%;
          }

          50% {
            top: 88%;
          }

          100% {
            top: 10%;
          }
        }

        .scan-line {
          animation: scanMove 2s linear infinite;
        }

        .corner {
          position: absolute;
          width: 34px;
          height: 34px;
          border-color: white;
        }

        .tl {
          top: -4px;
          left: -4px;
          border-top: 6px solid white;
          border-left: 6px solid white;
          border-top-left-radius: 14px;
        }

        .tr {
          top: -4px;
          right: -4px;
          border-top: 6px solid white;
          border-right: 6px solid white;
          border-top-right-radius: 14px;
        }

        .bl {
          bottom: -4px;
          left: -4px;
          border-bottom: 6px solid white;
          border-left: 6px solid white;
          border-bottom-left-radius: 14px;
        }

        .br {
          bottom: -4px;
          right: -4px;
          border-bottom: 6px solid white;
          border-right: 6px solid white;
          border-bottom-right-radius: 14px;
        }

        .spinner {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 5px solid
            rgba(255, 255, 255, 0.2);
          border-top: 5px solid white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
