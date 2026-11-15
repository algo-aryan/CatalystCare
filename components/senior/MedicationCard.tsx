'use client';

import React, { useState } from 'react';
import { Check, Clock, Volume2, VolumeX, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PillGraphic } from './PillGraphic';
import { TodayDoseSlot } from '@/lib/clinical/adherence-engine';

interface MedicationCardProps {
  slot: TodayDoseSlot;
  onTaken: (slot: TodayDoseSlot) => void;
  onSnooze: (slot: TodayDoseSlot) => void;
  onSpeak: (text: string, options?: { lang?: string; englishFallbackText?: string }) => void;
  isSpeaking: boolean;
  isLoadingVoice?: boolean;
  language?: 'EN' | 'HI';
}

export function MedicationCard({
  slot,
  onTaken,
  onSnooze,
  onSpeak,
  isSpeaking,
  isLoadingVoice = false,
  language = 'EN',
}: MedicationCardProps) {
  const [imageError, setImageError] = useState(false);
  const isTaken = slot.status === 'ADMINISTERED';
  const isOverdue = slot.status === 'OVERDUE' || slot.status === 'MISSED';

  const visual = slot.visualIdentity || {
    shape: 'ROUND_TABLET' as const,
    color: '#000000',
    colorLabelEnglish: 'Round Tablet',
    colorLabelHindi: 'गोल गोली',
    purposeLabelEnglish: 'Routine Medicine',
    purposeLabelHindi: 'दवाई',
    instructionsEnglish: slot.instructions,
    instructionsHindi: slot.instructions,
    mealTimingEnglish: 'Take with water',
    mealTimingHindi: 'पानी के साथ लें',
    voiceHindiScript: `सविता जी, यह आपकी दवाई ${slot.medicationName} है। कृपया समय पर लें।`,
    voiceEnglishScript: `Savita ji, this is your medication ${slot.medicationName}. Please take it as scheduled.`,
    photoUrl: undefined,
    photoAlt: undefined,
  };

  const handleVoiceClick = () => {
    onSpeak(visual.voiceHindiScript, { lang: 'hi-IN', englishFallbackText: visual.voiceEnglishScript });
  };

  return (
    <article
      role="article"
      aria-label={`Medication ${slot.medicationName}`}
      className="bg-white border-2 border-black rounded-3xl p-5 md:p-6 shadow-md transition-all"
    >
      {/* Top Clinical Status Header: Green, Black, White */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-black">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              isTaken
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-black text-white border-black'
            }`}
          >
            {isTaken
              ? (language === 'HI' ? 'स्थिति: पूर्ण' : 'STATUS: TAKEN')
              : (language === 'HI' ? 'स्थिति: वर्तमान खुराक' : 'STATUS: SCHEDULED')}
          </span>

          <span className="text-xs md:text-sm font-black text-black flex items-center gap-1 border border-black/20 bg-zinc-50 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-black" />
            <span>{slot.scheduledTimeStr} {parseInt(slot.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
          </span>
        </div>

        {/* Sarvam AI Audio Readout Button */}
        <button
          onClick={handleVoiceClick}
          disabled={isLoadingVoice}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-xs border-2 transition-all active:scale-95 outline-none ${
            isSpeaking
              ? 'bg-black text-white border-black animate-pulse'
              : isLoadingVoice
              ? 'bg-zinc-100 text-black border-black'
              : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-700'
          }`}
          aria-label="Listen with Sarvam AI Voice"
        >
          {isLoadingVoice ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              <span>VOICE LOADING...</span>
            </>
          ) : isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-white" />
              <span>STOP VOICE</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>LISTEN (SARVAM AI)</span>
            </>
          )}
        </button>
      </div>

      {/* Large Clear Medicine Image: Isolated Macro Product Shot */}
      <div className="pt-4 pb-2">
        <div className="relative rounded-2xl overflow-hidden border-2 border-black bg-white flex items-center justify-center min-h-[240px] max-h-[320px] p-2">
          {visual.photoUrl && !imageError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={visual.photoUrl}
              alt={visual.photoAlt || slot.medicationName}
              onError={() => setImageError(true)}
              className="w-full h-60 md:h-68 object-contain object-center"
            />
          ) : (
            <div className="py-8 flex flex-col items-center justify-center">
              <PillGraphic
                shape={visual.shape}
                color={visual.color}
                secondaryColor={visual.secondaryColor}
                size="lg"
              />
              <span className="text-xs font-bold text-black mt-2">
                {language === 'HI' ? visual.colorLabelHindi : visual.colorLabelEnglish}
              </span>
            </div>
          )}

          {/* Professional Clinical Identification Label Tag */}
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-white">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>
              {language === 'HI' ? 'सटीक दवा पहचान' : 'MEDICINE IDENTIFICATION'}
            </span>
          </div>

          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-white border border-black text-black text-[11px] font-black">
            {slot.dosage}
          </div>
        </div>

        {/* Clinical Information & Instructions */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-black uppercase tracking-wider">
              {language === 'HI' ? visual.purposeLabelHindi : visual.purposeLabelEnglish}
            </span>
            <span className="text-xs font-bold text-zinc-600">
              {visual.colorLabelEnglish}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-black tracking-tight leading-tight">
            {slot.medicationName}
          </h2>

          <p className="text-sm font-semibold text-zinc-800 leading-relaxed bg-zinc-50 border border-zinc-200 p-3 rounded-xl">
            {language === 'HI' ? visual.instructionsHindi : visual.instructionsEnglish}
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-black">
            <span>TIMING:</span>
            <span>{language === 'HI' ? visual.mealTimingHindi : visual.mealTimingEnglish}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Pure High-Contrast Green & Black */}
      <div className="pt-4 mt-3 border-t-2 border-black grid grid-cols-2 gap-3">
        <button
          onClick={() => onTaken(slot)}
          disabled={isTaken}
          className={`min-h-[52px] text-base font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] outline-none shadow-md ${
            isTaken
              ? 'bg-zinc-200 text-zinc-500 border-2 border-zinc-300 cursor-not-allowed shadow-none'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white border-2 border-black active:bg-emerald-900'
          }`}
        >
          {isTaken ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-zinc-500" />
              <span>{language === 'HI' ? 'दवाई ली जा चुकी है' : 'DOSE TAKEN'}</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{language === 'HI' ? 'दवाई ले ली' : 'I TOOK THIS PILL'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => onSnooze(slot)}
          disabled={isTaken}
          className="min-h-[52px] text-xs md:text-sm font-black rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] outline-none border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-sm"
        >
          <Clock className="w-4 h-4 text-black" />
          <span>{language === 'HI' ? '३० मिनट बाद याद दिलाएं' : 'REMIND IN 30 MINS'}</span>
        </button>
      </div>
    </article>
  );
}
