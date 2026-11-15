'use client';

import React from 'react';
import { Sun, Eye, Volume2 } from 'lucide-react';

interface AccessibilityToolbarProps {
  highContrast: boolean;
  onToggleHighContrast: () => void;
  largeFont: boolean;
  onToggleLargeFont: () => void;
}

export function AccessibilityToolbar({
  highContrast,
  onToggleHighContrast,
  largeFont,
  onToggleLargeFont,
}: AccessibilityToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Elderly Accessibility Controls"
      className="flex items-center gap-3"
    >
      <button
        onClick={onToggleHighContrast}
        className={`px-4 py-2 rounded-xl font-bold border-2 flex items-center gap-2 min-h-[48px] focus:ring-4 focus:ring-yellow-400 outline-none transition-all ${
          highContrast ? 'bg-yellow-400 text-black border-black' : 'bg-blue-800 text-white border-blue-600'
        }`}
        aria-pressed={highContrast}
        aria-label="Toggle high contrast color mode for low vision"
      >
        <Sun className="w-5 h-5" />
        <span>Contrast: {highContrast ? 'AAA (ON)' : 'Standard'}</span>
      </button>

      <button
        onClick={onToggleLargeFont}
        className={`px-4 py-2 rounded-xl font-bold border-2 flex items-center gap-2 min-h-[48px] focus:ring-4 focus:ring-yellow-400 outline-none transition-all ${
          largeFont ? 'bg-yellow-400 text-black border-black' : 'bg-blue-800 text-white border-blue-600'
        }`}
        aria-pressed={largeFont}
        aria-label="Toggle extra large font size for presbyopia"
      >
        <Eye className="w-5 h-5" />
        <span>Text: {largeFont ? '28px (XL)' : '20px'}</span>
      </button>
    </div>
  );
}
