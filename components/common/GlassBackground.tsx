import React from 'react';

export function GlassBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Luxury frosted glass backdrop image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 mix-blend-multiply transition-opacity duration-700"
        style={{ backgroundImage: `url('/backgrounds/glass-bg.jpg'), url('/backgrounds/glass-ambient.svg')` }}
      />
      {/* Soft atmospheric gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-slate-50/70 to-emerald-50/40 backdrop-blur-[2px]" />
      
      {/* Ambient refractive glow orbs for floating glass depth */}
      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-emerald-200/35 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-[36rem] h-[36rem] rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[40rem] h-[40rem] rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
    </div>
  );
}
