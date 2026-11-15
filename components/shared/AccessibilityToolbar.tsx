'use client';

import React from 'react';
import { Languages } from 'lucide-react';

interface AccessibilityToolbarProps {
  language?: 'EN' | 'HI';
  onToggleLanguage?: () => void;
}

export function AccessibilityToolbar({
  language = 'EN',
  onToggleLanguage,
}: AccessibilityToolbarProps) {
  if (!onToggleLanguage) return null;

  return (
    <div role="toolbar" aria-label="Language Controls" className="flex items-center gap-2">
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
    </div>
  );
}
