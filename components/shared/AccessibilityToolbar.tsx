'use client';

import React from 'react';
import { Sun, Eye, Languages } from 'lucide-react';

interface AccessibilityToolbarProps {
  highContrast: boolean;
  onToggleHighContrast: () => void;
  largeFont: boolean;
  onToggleLargeFont: () => void;
  language?: 'EN' | 'HI';
  onToggleLanguage?: () => void;
}

export function AccessibilityToolbar({
  highContrast,
  onToggleHighContrast,
  largeFont,
  onToggleLargeFont,
  language = 'EN',
  onToggleLanguage,
}: AccessibilityToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Elderly Accessibility Controls"
      className="flex flex-wrap items-center gap-2 md:gap-3"
    >
      {/* Language Switcher (Hindi / English) */}
      {onToggleLanguage && (
        <button
          onClick={onToggleLanguage}
          className={`px-3 md:px-4 py-2 rounded-xl font-black text-sm md:text-base border-2 flex items-center gap-2 min-h-[48px] focus:ring-4 focus:ring-amber-400 outline-none transition-all ${
            language === 'HI'
              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md'
              : 'bg-blue-800 text-white border-blue-600 hover:bg-blue-750'
          }`}
          aria-label="Toggle language between English and Hindi"
        >
          <Languages className="w-5 h-5 text-amber-300" />
          <span>भाषा: {language === 'HI' ? 'हिंदी (Active)' : 'English'}</span>
        </button>
      )}

      {/* High Contrast Toggle */}
      <button
        onClick={onToggleHighContrast}
        className={`px-3 md:px-4 py-2 rounded-xl font-bold text-sm md:text-base border-2 flex items-center gap-2 min-h-[48px] focus:ring-4 focus:ring-yellow-400 outline-none transition-all ${
          highContrast
            ? 'bg-yellow-400 text-slate-950 border-black shadow-md font-black'
            : 'bg-blue-800 text-white border-blue-600 hover:bg-blue-750'
        }`}
        aria-pressed={highContrast}
        aria-label="Toggle high contrast color mode for low vision"
      >
        <Sun className="w-5 h-5" />
        <span>Contrast: {highContrast ? 'AAA High' : 'Standard'}</span>
      </button>

      {/* Font Size Toggle */}
      <button
        onClick={onToggleLargeFont}
        className={`px-3 md:px-4 py-2 rounded-xl font-bold text-sm md:text-base border-2 flex items-center gap-2 min-h-[48px] focus:ring-4 focus:ring-yellow-400 outline-none transition-all ${
          largeFont
            ? 'bg-yellow-400 text-slate-950 border-black shadow-md font-black'
            : 'bg-blue-800 text-white border-blue-600 hover:bg-blue-750'
        }`}
        aria-pressed={largeFont}
        aria-label="Toggle extra large font size for elderly presbyopia"
      >
        <Eye className="w-5 h-5" />
        <span>Text: {largeFont ? '28px (XL)' : '20px'}</span>
      </button>
    </div>
  );
}
