'use client';

import React from 'react';

interface PillGraphicProps {
  shape?: 'ROUND_TABLET' | 'OVAL_TABLET' | 'CAPSULE' | 'TRIANGLE_TABLET';
  color?: string;
  secondaryColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PillGraphic({
  shape = 'ROUND_TABLET',
  color = '#FFFFFF',
  secondaryColor = '#FBBF24',
  size = 'md',
  className = '',
}: PillGraphicProps) {
  const dimensions = {
    sm: { width: 52, height: 52 },
    md: { width: 84, height: 84 },
    lg: { width: 110, height: 110 },
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center p-3 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-inner ${className}`}
      style={{ width: dimensions.width + 24, height: dimensions.height + 24 }}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-md"
      >
        <defs>
          {/* Radial Pill Shading */}
          <radialGradient id={`pill-glow-${color}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="45%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </radialGradient>

          <linearGradient id={`capsule-grad-${color}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id={`capsule-second-${secondaryColor}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="50%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {shape === 'ROUND_TABLET' && (
          <g>
            {/* Outer Drop Rim */}
            <circle cx="50" cy="50" r="42" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
            {/* Main Tablet Surface */}
            <circle cx="50" cy="50" r="39" fill={`url(#pill-glow-${color})`} />
            {/* Inner Score Line (Break Line for Half Dose) */}
            <line
              x1="50"
              y1="18"
              x2="50"
              y2="82"
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Highlight crescent */}
            <ellipse cx="36" cy="30" rx="14" ry="7" fill="#FFFFFF" opacity="0.45" transform="rotate(-30 36 30)" />
          </g>
        )}

        {shape === 'OVAL_TABLET' && (
          <g>
            {/* Oval Pill Body */}
            <rect
              x="12"
              y="30"
              width="76"
              height="40"
              rx="20"
              fill={`url(#pill-glow-${color})`}
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            {/* Center Score Line */}
            <line
              x1="50"
              y1="30"
              x2="50"
              y2="70"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Gloss Reflection */}
            <ellipse cx="40" cy="40" rx="20" ry="6" fill="#FFFFFF" opacity="0.4" transform="rotate(-15 40 40)" />
          </g>
        )}

        {shape === 'CAPSULE' && (
          <g transform="rotate(-30 50 50)">
            {/* Left/Bottom Half */}
            <path
              d="M 18 50 C 18 36, 32 36, 48 36 L 48 64 C 32 64, 18 64, 18 50 Z"
              fill={`url(#capsule-grad-${color})`}
            />
            {/* Right/Top Half */}
            <path
              d="M 48 36 C 64 36, 82 36, 82 50 C 82 64, 64 64, 48 64 Z"
              fill={`url(#capsule-second-${secondaryColor})`}
            />
            {/* Capsule Center Seam */}
            <line x1="48" y1="36" x2="48" y2="64" stroke="#000000" strokeWidth="1.5" opacity="0.4" />
            {/* Gloss Line */}
            <ellipse cx="35" cy="44" rx="18" ry="4" fill="#FFFFFF" opacity="0.5" />
          </g>
        )}

        {shape === 'TRIANGLE_TABLET' && (
          <g>
            <polygon
              points="50,14 86,78 14,78"
              fill={`url(#pill-glow-${color})`}
              stroke="#CBD5E1"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="54" r="6" fill="#94A3B8" opacity="0.4" />
          </g>
        )}
      </svg>
    </div>
  );
}
