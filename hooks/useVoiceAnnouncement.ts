'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoiceAnnouncement() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceEngine, setVoiceEngine] = useState<'SARVAM_AI' | 'INDIC_DEVICE'>('SARVAM_AI');
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Load client voices as backup
  const refreshVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      setVoices(available);

      const indianVoice =
        available.find((v) => v.lang === 'hi-IN') ||
        available.find((v) => v.lang === 'en-IN') ||
        available.find((v) => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('rishi')) ||
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
    setIsLoadingVoice(false);
  }, []);

  const speak = useCallback(
    async (text: string, options?: { lang?: string; rate?: number }) => {
      stop();
      setIsLoadingVoice(true);

      // Default voice language is Hindi ('hi-IN') per requirements
      const targetLang = options?.lang || 'hi-IN';

      try {
        // 1. Call Sarvam AI Indic Neural TTS
        const res = await fetch('/api/voice/sarvam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            language: targetLang,
            speaker: 'priya',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioDataUrl) {
            setVoiceEngine('SARVAM_AI');
            const audio = new Audio(data.audioDataUrl);
            audioPlayerRef.current = audio;

            audio.onplay = () => {
              setIsLoadingVoice(false);
              setIsSpeaking(true);
            };

            audio.onended = () => {
              setIsSpeaking(false);
              audioPlayerRef.current = null;
            };

            audio.onerror = (e) => {
              console.warn('[Voice] Audio error, falling back:', e);
              setIsSpeaking(false);
              setIsLoadingVoice(false);
              playFallbackSpeech(text, targetLang, options?.rate);
            };

            await audio.play();
            return;
          }
        }
      } catch (err) {
        console.warn('[Voice] Sarvam AI endpoint error, using fallback:', err);
      }

      // 2. Only if Sarvam is unavailable, fall back to browser speech synthesis
      setIsLoadingVoice(false);
      playFallbackSpeech(text, targetLang, options?.rate);
    },
    [stop]
  );

  const playFallbackSpeech = (text: string, targetLang: string, rate: number = 0.78) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setVoiceEngine('INDIC_DEVICE');
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    let chosenVoice = selectedVoice;
    if (targetLang.startsWith('hi')) {
      const hi = voices.find((v) => v.lang.startsWith('hi'));
      if (hi) chosenVoice = hi;
    } else {
      const en = voices.find((v) => v.lang === 'en-IN');
      if (en) chosenVoice = en;
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return {
    speak,
    stop,
    isSpeaking,
    isLoadingVoice,
    voiceEngine,
    selectedVoiceName: voiceEngine === 'SARVAM_AI' ? 'Sarvam AI (Priya • Hindi Neural)' : 'Indic Device Voice',
  };
}
