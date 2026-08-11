import React from 'react';

/**
 * 3D-ish phone body matching the landing page's DeviceFrames look:
 * metallic chamfer, black bezel, dynamic island. Sized for the 1920x1080
 * canvas: screen is 396x858 (390x844 aspect + rounding), centered.
 */
export const PHONE = {
  screenW: 396,
  screenH: 858,
  bezel: 12,
  chamfer: 3,
};
export const PHONE_W = PHONE.screenW + 2 * (PHONE.bezel + PHONE.chamfer);
export const PHONE_H = PHONE.screenH + 2 * (PHONE.bezel + PHONE.chamfer);

export const PhoneFrame: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 64,
        padding: PHONE.chamfer,
        background: 'linear-gradient(145deg, rgba(148,163,184,0.9) 0%, #334155 40%, #020617 100%)',
        boxShadow: '0 60px 120px -30px rgba(2,6,23,0.65)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 61,
          background: '#000',
          padding: PHONE.bezel,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: PHONE.screenW,
            height: PHONE.screenH,
            borderRadius: 50,
            overflow: 'hidden',
            position: 'relative',
            background: '#020617',
          }}
        >
          {children}
        </div>
        {/* dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: PHONE.bezel + 14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 30,
            borderRadius: 20,
            background: '#000',
          }}
        />
      </div>
    </div>
  );
};
