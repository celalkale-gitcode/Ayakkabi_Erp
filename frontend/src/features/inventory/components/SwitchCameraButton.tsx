'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SwitchCameraProps {
  activeCamera: 'front' | 'back';
  onCameraChange: (camera: 'front' | 'back') => void;
}

const SwitchCameraButton: React.FC<SwitchCameraProps> = ({ activeCamera, onCameraChange }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handlePress = () => setIsPressed(true);
  const handleRelease = () => setIsPressed(false);

  // Menü açıkken dışarıya tıklanırsa menüyü kapatır
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'absolute', top: '24px', right: '82px', zIndex: 30 }}>
      {/* Ana Buton */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          // Menü açıkken hafif koyu arka plan, kapalıyken standart şeffaf beyaz
          background: isOpen ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s ease',
          transform: isPressed ? 'scale(0.85)' : 'scale(1)',
          outline: '0',
          WebkitTapHighlightColor: 'transparent',
          WebkitAppearance: 'none',
          boxShadow: 'none',
          touchAction: 'manipulation'
        }}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill={isOpen ? '#fff' : 'rgba(0, 0, 0, 0.7)'}
          style={{ pointerEvents: 'none', transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          {/* Kamera Değiştirme / Döndürme İkonu */}
          <path d="M9 12c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3zm11-4h-3.17L15 4H9L7.17 8H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zm-8 11c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
        </svg>
      </button>

      {/* Açılır Menü (Dropdown) */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '42px',
            right: '0',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minWidth: '120px',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <button
            onClick={() => { onCameraChange('front'); setIsOpen(false); }}
            style={{
              padding: '8px 12px',
              background: activeCamera === 'front' ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: activeCamera === 'front' ? '600' : '400',
              color: '#000',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            Ön Kamera {activeCamera === 'front' && ' ✓'}
          </button>
          
          <button
            onClick={() => { onCameraChange('back'); setIsOpen(false); }}
            style={{
              padding: '8px 12px',
              background: activeCamera === 'back' ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: activeCamera === 'back' ? '600' : '400',
              color: '#000',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            Arka Kamera {activeCamera === 'back' && ' ✓'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SwitchCameraButton;
