'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoiceAnnouncement() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceEngine, setVoiceEngine] = useState<'SARVAM_AI' | 'INDIC_DEVICE'>('SARVAM_AI');
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const refreshVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      setVoices(available);
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
    async (
      text: string, 
      options?: { 
        lang?: string; 
        englishFallbackText?: string; 
        rate?: number 
      }
    ) => {
      stop();
      setIsLoadingVoice(true);

      const targetLang = options?.lang || 'hi-IN';

      try {
        // 1. Try Sarvam AI Indic Neural TTS
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

            audio.onerror = () => {
              setIsSpeaking(false);
              setIsLoadingVoice(false);
              fallbackToClientSpeech(text, targetLang, options?.englishFallbackText, options?.rate);
            };

            try {
              await audio.play();
              return;
            } catch (playErr) {
              console.warn('[Voice] Audio autoplay error, falling back:', playErr);
            }
          }
        }
      } catch (err) {
        console.warn('[Voice] Sarvam AI endpoint error:', err);
      }

      // 2. Fallback to client speech synthesis safely without "comma" bugs
      setIsLoadingVoice(false);
      fallbackToClientSpeech(text, targetLang, options?.englishFallbackText, options?.rate);
    },
    [stop, voices]
  );

  const fallbackToClientSpeech = (
    text: string,
    targetLang: string,
    englishFallbackText?: string,
    rate: number = 0.8
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setVoiceEngine('INDIC_DEVICE');
    window.speechSynthesis.cancel();

    const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const hindiVoice = availableVoices.find((v) => v.lang.startsWith('hi'));
    const indianEnVoice = availableVoices.find((v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india'));
    const englishVoice = availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0];

    let chosenVoice = hindiVoice;
    let spokenText = text;

    // Critical safety: If system has NO Hindi voice, NEVER send Devanagari text
    // to an English voice engine or it will read punctuation literally ("comma, exclamation point")!
    if (!hindiVoice) {
      chosenVoice = indianEnVoice || englishVoice;
      spokenText = englishFallbackText || 'Savita ji, it is time for your medication. Please take your dose as scheduled.';
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = rate;
    utterance.pitch = 1.0;

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
  };
}
