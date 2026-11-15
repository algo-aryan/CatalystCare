'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Clock, Volume2, VolumeX, Loader2, Sparkles, MapPin } from 'lucide-react';
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
  const isOverdue = slot.status === 'OVERDUE' || slot.status === 'MISSED';
  const isTaken = slot.status === 'ADMINISTERED';

  const visual = slot.visualIdentity || {
    shape: 'ROUND_TABLET' as const,
    color: '#FFFFFF',
    colorLabelEnglish: 'White Round Tablet',
    colorLabelHindi: 'सफ़ेद गोल गोली',
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
      className={`relative overflow-hidden rounded-3xl p-5 md:p-6 transition-all backdrop-blur-xl border ${
        isOverdue
          ? 'bg-gradient-to-b from-amber-50/90 to-white/90 border-amber-300/80 shadow-[0_12px_36px_rgba(245,158,11,0.12)]'
          : 'bg-white/85 border-white/70 shadow-[0_12px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-900/5'
      }`}
    >
      {/* Top Chromatic Light Specular Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent pointer-events-none" />

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100/80">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm ${
              isOverdue
                ? 'bg-amber-100/90 text-amber-900 border border-amber-200'
                : isTaken
                ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-200'
                : 'bg-teal-50/90 text-teal-900 border border-teal-200/80'
            }`}
          >
            {isOverdue
              ? language === 'HI' ? 'समय बीत चुका है' : 'Overdue'
              : isTaken
              ? language === 'HI' ? 'पूर्ण' : 'Taken'
              : language === 'HI' ? 'अभी का समय' : 'Due Now'}
          </span>

          <span className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{slot.scheduledTimeStr} {parseInt(slot.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
          </span>
        </div>

        {/* Sarvam AI Audio Readout Button */}
        <button
          onClick={handleVoiceClick}
          disabled={isLoadingVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs border backdrop-blur-sm transition-all active:scale-95 outline-none shadow-sm ${
            isSpeaking
              ? 'bg-rose-50/90 text-rose-700 border-rose-300 animate-pulse'
              : isLoadingVoice
              ? 'bg-teal-50/90 text-teal-800 border-teal-300'
              : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:text-teal-900'
          }`}
          aria-label="Listen with Sarvam AI"
        >
          {isLoadingVoice ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
              <span>Voice Loading...</span>
            </>
          ) : isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-600" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Listen (Sarvam AI)</span>
            </>
          )}
        </button>
      </div>

      {/* Bedside Recognition Photo + Pill Visual Identity */}
      <div className="pt-4 pb-2">
        {visual.photoUrl && (
          <div className="mb-4 relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visual.photoUrl}
              alt={visual.photoAlt || slot.medicationName}
              className="w-full h-44 object-cover object-center group-hover:scale-102 transition-transform duration-300"
            />
            {/* Frosted Bedside Recognition Tag */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-between text-xs font-semibold shadow-lg">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">
                  {language === 'HI' ? 'बिस्तर के पास रात की मेज पर पहचानें' : 'Bedside Nightstand Recognition'}
                </span>
              </span>
              <span className="text-[11px] font-normal text-slate-300 shrink-0 hidden sm:inline">
                {visual.shape === 'OVAL_TABLET' ? 'Foil Strip' : 'Pills / Blister'}
              </span>
            </div>
          </div>
        )}

        {/* Content details and Pill graphic */}
        <div className="flex items-start gap-4">
          {/* Pill Graphic Illustration */}
          <div className="shrink-0 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col items-center justify-center min-w-[76px] shadow-sm">
            <PillGraphic
              shape={visual.shape}
              color={visual.color}
              secondaryColor={visual.secondaryColor}
              size="md"
            />
            <span className="text-[10px] font-bold mt-1 text-slate-600 text-center leading-tight">
              {language === 'HI' ? visual.colorLabelHindi : visual.colorLabelEnglish}
            </span>
          </div>

          {/* Text descriptions */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>{language === 'HI' ? visual.purposeLabelHindi : visual.purposeLabelEnglish}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-slate-900 truncate mt-0.5">
              {language === 'HI' ? visual.purposeLabelHindi : slot.medicationName}
            </h2>

            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              {slot.medicationName} • {slot.dosage}
            </div>

            <p className="text-xs md:text-sm font-medium text-slate-700 mt-2 leading-relaxed">
              {language === 'HI' ? visual.instructionsHindi : visual.instructionsEnglish}
            </p>

            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/80 border border-teal-100 text-xs font-bold text-teal-900">
              <span>🍽️</span>
              <span>{language === 'HI' ? visual.mealTimingHindi : visual.mealTimingEnglish}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: High Touch Target & Tactile Sheen */}
      <div className="pt-4 mt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
        <button
          onClick={() => onTaken(slot)}
          disabled={isTaken}
          className={`min-h-[50px] text-sm md:text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] outline-none shadow-md ${
            isTaken
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white shadow-emerald-700/20'
          }`}
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>{language === 'HI' ? 'दवाई ले ली' : 'I Took This Pill'}</span>
        </button>

        <button
          onClick={() => onSnooze(slot)}
          disabled={isTaken}
          className="min-h-[50px] text-xs md:text-sm font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] outline-none border bg-white/90 hover:bg-white text-slate-700 border-slate-200 shadow-sm"
        >
          <Clock className="w-4 h-4 text-slate-500" />
          <span>{language === 'HI' ? '३० मिनट बाद याद दिलाएं' : 'Remind in 30 Mins'}</span>
        </button>
      </div>
    </article>
  );
}
