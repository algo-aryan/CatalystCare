'use client';

import React from 'react';
import { Sun, Languages } from 'lucide-react';

interface AccessibilityToolbarProps {
  highContrast: boolean;
  onToggleHighContrast: () => void;
  language?: 'EN' | 'HI';
  onToggleLanguage?: () => void;
}

export function AccessibilityToolbar({
  highContrast,
  onToggleHighContrast,
  language = 'EN',
  onToggleLanguage,
}: AccessibilityToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Accessibility Controls"
      className="flex items-center gap-2"
    >
      {/* Language Switcher */}
      {onToggleLanguage && (
        <button
          onClick={onToggleLanguage}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm border flex items-center gap-1.5 min-h-[38px] outline-none transition-all ${
            language === 'HI'
              ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
          aria-label="Toggle language between English and Hindi"
        >
          <Languages className="w-4 h-4" />
          <span>{language === 'HI' ? 'भाषा: हिंदी' : 'Language: English'}</span>
        </button>
      )}

      {/* High Contrast Toggle */}
      <button
        onClick={onToggleHighContrast}
        className={`px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm border flex items-center gap-1.5 min-h-[38px] outline-none transition-all ${
          highContrast
            ? 'bg-yellow-400 text-slate-950 border-black shadow-sm font-black'
            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
        }`}
        aria-pressed={highContrast}
        aria-label="Toggle high contrast mode"
      >
        <Sun className="w-4 h-4" />
        <span>{highContrast ? 'Contrast: High AAA' : 'Contrast: Standard'}</span>
      </button>
    </div>
  );
}
