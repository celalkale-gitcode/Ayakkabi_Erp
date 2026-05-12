import React from 'react';

// Props tiplerini tanımlıyoruz
interface CameraButtonProps {
  scanning: boolean;
  start: () => void;
  stop: () => void;
  processing: boolean;
}

const CameraButton: React.FC<CameraButtonProps> = ({ scanning, start, stop, processing }) => {
  if (processing) return null;

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(0.85)';
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <button
      onClick={scanning ? stop : start}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        // Aktifken kırmızı, değilse yarı şeffaf beyaz
        background: scanning ? 'rgba(220, 38, 38, 0.9)' : 'rgba(255, 255, 255, 0.5)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 30,
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(4px)',
        outline: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        WebkitTapHighlightColor: 'transparent', // Köşeli mavi kutuyu silen sihirli satır
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={scanning ? "white" : "#333"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    </button>
  );
};

export default CameraButton;

