'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoiceAnnouncement() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceEngine, setVoiceEngine] = useState<'SARVAM_AI' | 'INDIC_DEVICE'>('INDIC_DEVICE');
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Load and prioritize Indian English & Hindi voices for fallback
  const refreshVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      setVoices(available);

      const indianVoice =
        available.find((v) => v.lang === 'hi-IN') ||
        available.find((v) => v.lang === 'en-IN') ||
        available.find((v) => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('rishi')) ||
        available.find((v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google'))) ||
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
      stop();
    };
  }, [refreshVoices]);

  const stop = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, options?: { lang?: string; rate?: number; pitch?: number }) => {
      stop();
      setIsSpeaking(true);

      const targetLang = options?.lang || 'hi-IN';

      // 1. Try Sarvam AI Indic Neural TTS First
      try {
        const res = await fetch('/api/voice/sarvam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            language: targetLang,
            speaker: 'meera',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioDataUrl) {
            setVoiceEngine('SARVAM_AI');
            const audio = new Audio(data.audioDataUrl);
            audioPlayerRef.current = audio;
            audio.onended = () => {
              setIsSpeaking(false);
              audioPlayerRef.current = null;
            };
            audio.onerror = () => {
              setIsSpeaking(false);
              audioPlayerRef.current = null;
            };
            await audio.play();
            return;
          }
        }
      } catch (e) {
        console.warn('[Voice] Sarvam AI endpoint error, using Indic client voice:', e);
      }

      // 2. Client-side Speech Synthesis Fallback
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setVoiceEngine('INDIC_DEVICE');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options?.rate ?? 0.76; // Calm, slow pace for elders
        utterance.pitch = options?.pitch ?? 1.0;

        let chosenVoice = selectedVoice;
        if (targetLang.startsWith('hi')) {
          const hindiVoice = voices.find((v) => v.lang.startsWith('hi'));
          if (hindiVoice) chosenVoice = hindiVoice;
        } else {
          const indianEn = voices.find((v) => v.lang === 'en-IN');
          if (indianEn) chosenVoice = indianEn;
        }

        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    },
    [selectedVoice, voices, stop]
  );

  return {
    speak,
    stop,
    isSpeaking,
    voiceEngine,
    selectedVoiceName: voiceEngine === 'SARVAM_AI' ? 'Sarvam AI (Meera • Hindi Neural)' : selectedVoice?.name || 'Indic Voice',
  };
}
