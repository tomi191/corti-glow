"use client";

export function PremiumBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1] bg-brand-sand">
      {/* CSS-animated blobs — no JS per frame */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand-sage/40 rounded-full mix-blend-multiply blur-[120px] opacity-60 animate-blob-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-brand-cream/60 rounded-full mix-blend-multiply blur-[140px] opacity-70 animate-blob-2" />
      <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-brand-blush/20 rounded-full mix-blend-multiply blur-[100px] animate-blob-3" />

      {/* SVG Noise overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.4] mix-blend-overlay pointer-events-none">
        <filter id="premium-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#premium-noise)" />
      </svg>
    </div>
  );
}
