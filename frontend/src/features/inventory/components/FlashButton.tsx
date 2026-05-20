'use client';

import React, { useState } from 'react';

interface FlashButtonProps {
  flashOn: boolean;
  turnOn: () => void;
  turnOff: () => void;
}

const FlashButton: React.FC<FlashButtonProps> = ({ flashOn, turnOn, turnOff }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => setIsPressed(true);
  const handleRelease = () => setIsPressed(false);

  return (
    <button
      onClick={flashOn ? turnOff : turnOn}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      style={{
        position: 'absolute',
        top: '24px',       // Kamera butonuyla aynı hizada (dikey)
        left: '24px',      // Kamera butonu sağda olduğu için bunu sola aldım
        width: '34px',     // Tam olarak aynı boyut
        height: '34px',    // Tam olarak aynı boyut
        borderRadius: '50%',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: 'none',
        // Flaş açıkken sarımsı/turuncu şeffaf bir arka plan, kapalıyken beyaz şeffaf
        background: flashOn ? 'rgba(255, 165, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
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
        width="16" // Aynı ikon boyutu
        height="16" 
        viewBox="0 0 24 24" 
        // Flaş açıkken beyaz, kapalıyken koyu gri/siyah ikon rengi
        fill={flashOn ? '#fff' : 'rgba(0, 0, 0, 0.7)'}
        style={{ pointerEvents: 'none' }}
      >
        {/* Flash / Şimşek İkonu */}
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
    </button>
  );
};

export default FlashButton;
