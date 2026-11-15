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
    color: '#059669',
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
      className="relative overflow-hidden rounded-3xl p-6 md:p-7 bg-white/75 backdrop-blur-2xl border border-white/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.04)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95)] hover:shadow-[0_25px_60px_-12px_rgba(5,150,105,0.16)] transition-all duration-300 h-full flex flex-col justify-between"
    >
      {/* Top Subtle Emerald Gradient Sheen */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-90" />

      {/* Top Status Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              isTaken
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-950 border border-emerald-200/80 shadow-sm'
            }`}
          >
            {isTaken
              ? (language === 'HI' ? 'स्थिति: पूर्ण' : 'STATUS: TAKEN')
              : (language === 'HI' ? 'स्थिति: वर्तमान खुराक' : 'STATUS: SCHEDULED')}
          </span>

          <span className="text-xs md:text-sm font-bold text-slate-700 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/70">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span>{slot.scheduledTimeStr} {parseInt(slot.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
          </span>
        </div>

        {/* Sarvam AI Audio Readout Button */}
        <button
          onClick={handleVoiceClick}
          disabled={isLoadingVoice}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs border backdrop-blur-md transition-all active:scale-95 outline-none shadow-sm ${
            isSpeaking
              ? 'bg-emerald-700 text-white border-emerald-800 animate-pulse'
              : isLoadingVoice
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-white hover:bg-emerald-50/80 text-emerald-900 border-emerald-200 hover:border-emerald-400'
          }`}
          aria-label="Listen with Sarvam AI Voice"
        >
          {isLoadingVoice ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
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

      {/* Large Clear Medicine Image: Macro Product Shot with Frosted Frame */}
      <div className="pt-4 pb-2">
        <div className="relative rounded-2xl overflow-hidden bg-white/95 border border-slate-200/80 shadow-inner flex items-center justify-center min-h-[250px] max-h-[320px] p-3">
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
              <span className="text-xs font-bold text-slate-700 mt-2">
                {language === 'HI' ? visual.colorLabelHindi : visual.colorLabelEnglish}
              </span>
            </div>
          )}

          {/* Frosted Clinical Identification Tag */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-emerald-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-200/80 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === 'HI' ? 'सटीक दवा पहचान' : 'MEDICINE IDENTIFICATION'}
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-slate-900 text-xs font-bold shadow-sm">
            {slot.dosage}
          </div>
        </div>

        {/* Clinical Information & Instructions */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 border border-emerald-200/70 text-xs font-bold uppercase tracking-wider">
              {language === 'HI' ? visual.purposeLabelHindi : visual.purposeLabelEnglish}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {visual.colorLabelEnglish}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {slot.medicationName}
          </h2>

          <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50/80 border border-slate-100 p-3 rounded-2xl">
            {language === 'HI' ? visual.instructionsHindi : visual.instructionsEnglish}
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 text-emerald-950 text-xs font-bold shadow-sm">
            <span className="text-emerald-700 font-black">TIMING:</span>
            <span>{language === 'HI' ? visual.mealTimingHindi : visual.mealTimingEnglish}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: High-End Green Gradient & Frosted Glass */}
      <div className="pt-4 mt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
        <button
          onClick={() => onTaken(slot)}
          disabled={isTaken}
          className={`min-h-[52px] text-sm md:text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] outline-none shadow-md ${
            isTaken
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-700/20 active:scale-95'
          }`}
        >
          {isTaken ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-slate-400" />
              <span>{language === 'HI' ? 'दवाई ली जा चुकी है' : 'DOSE TAKEN'}</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>{language === 'HI' ? 'दवाई ले ली' : 'I TOOK THIS PILL'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => onSnooze(slot)}
          disabled={isTaken}
          className="min-h-[52px] text-xs md:text-sm font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] outline-none border border-slate-200/80 bg-white/90 hover:bg-white text-slate-700 shadow-sm"
        >
          <Clock className="w-4 h-4 text-slate-500" />
          <span>{language === 'HI' ? '३० मिनट बाद याद दिलाएं' : 'REMIND IN 30 MINS'}</span>
        </button>
      </div>
    </article>
  );
}
