'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceAnnouncerProps {
  onSpeak: () => void;
  isSpeaking: boolean;
  label?: string;
}

export function VoiceAnnouncer({ onSpeak, isSpeaking, label = 'Read Aloud' }: VoiceAnnouncerProps) {
  return (
    <button
      onClick={onSpeak}
      className="flex items-center gap-2 text-blue-800 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-2xl font-bold min-h-[52px] outline-none focus:ring-4 focus:ring-blue-500"
      aria-label={isSpeaking ? 'Stop audio voice announcement' : 'Listen to medication instructions read aloud'}
    >
      {isSpeaking ? <VolumeX className="w-6 h-6 text-red-600" /> : <Volume2 className="w-6 h-6 text-blue-700" />}
      <span className="text-base md:text-lg">{isSpeaking ? 'Stop Voice' : label}</span>
    </button>
  );
}
