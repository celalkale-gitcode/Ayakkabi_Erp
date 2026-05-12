'use client';

import React, { useState } from 'react';

interface CameraButtonProps {
  scanning: boolean;
  start: () => void;
  stop: () => void;
}

const CameraButton: React.FC<CameraButtonProps> = ({ scanning, start, stop }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => setIsPressed(true);
  const handleRelease = () => setIsPressed(false);

  return (
    <button
      onClick={scanning ? stop : start}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      style={{
        position: 'absolute',
        top: '24px',    // Senin kodundaki tam konum
        right: '24px',  // Senin kodundaki tam konum
        width: '34px',  // Senin kodundaki tam boyut
        height: '34px', // Senin kodundaki tam boyut
        borderRadius: '50%',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: 'none',
        // Dinamik renkler ve şeffaflık
        background: scanning ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(4px)',
        // Animasyon ve basılma efekti
        transition: 'all 0.2s ease',
        transform: isPressed ? 'scale(0.85)' : 'scale(1)',
        // Keskin kenar ve mobil tarayıcı düzeltmeleri
        outline: '0',
        WebkitTapHighlightColor: 'transparent',
        WebkitAppearance: 'none',
        boxShadow: 'none',
        touchAction: 'manipulation'
      }}
    >
      <svg 
        width="16" // Senin kodundaki tam ikon boyutu
        height="16" 
        viewBox="0 0 24 24" 
        fill={scanning ? '#fff' : 'rgba(0, 0, 0, 0.7)'}
        style={{ pointerEvents: 'none' }}
      >
        <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
      </svg>
    </button>
  );
};

export default CameraButton;
