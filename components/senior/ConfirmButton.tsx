'use client';

import React from 'react';

interface ConfirmButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  ariaLabel: string;
  disabled?: boolean;
}

export function ConfirmButton({
  onClick,
  children,
  variant = 'primary',
  ariaLabel,
  disabled = false,
}: ConfirmButtonProps) {
  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30',
    secondary: 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`min-h-[72px] md:min-h-[84px] w-full text-2xl md:text-3xl font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] outline-none focus:ring-4 focus:ring-blue-500 disabled:opacity-50 ${variantStyles}`}
    >
      {children}
    </button>
  );
}
