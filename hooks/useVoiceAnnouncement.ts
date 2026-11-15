'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoiceAnnouncement() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load and prioritize Indian English & Hindi voices
  const refreshVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      setVoices(available);

      // Prioritize Indian English / Hindi voices
      const indianVoice =
        available.find((v) => v.lang === 'en-IN') ||
        available.find((v) => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('rishi')) ||
        available.find((v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google'))) ||
        available.find((v) => v.lang.startsWith('en')) ||
        available[0];

      if (indianVoice) {
        setSelectedVoice(indianVoice);
      }
    }
  }, []);

  useEffect(() => {
    refreshVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [refreshVoices]);

  const speak = useCallback(
    (text: string, options?: { rate?: number; pitch?: number; lang?: string }) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 0.78; // Gentle, clear speed for seniors
      utterance.pitch = options?.pitch ?? 1.0;

      // Find matching voice or use preselected Indian voice
      let chosenVoice = selectedVoice;
      if (options?.lang) {
        const matching = voices.find((v) => v.lang.startsWith(options.lang!));
        if (matching) chosenVoice = matching;
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn('[VoiceAnnouncement] Speech error:', e);
        setIsSpeaking(false);
      };

      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, voices]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { 
    speak, 
    stop, 
    isSpeaking, 
    voices, 
    selectedVoiceName: selectedVoice?.name || 'Standard Voice' 
  };
}
