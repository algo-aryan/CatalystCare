'use client';

import React from 'react';
import { Check, Clock, Volume2, VolumeX, Loader2 } from 'lucide-react';
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
  };

  const handleVoiceClick = () => {
    onSpeak(visual.voiceHindiScript, { lang: 'hi-IN', englishFallbackText: visual.voiceEnglishScript });
  };

  return (
    <article
      role="article"
      aria-label={`Medication ${slot.medicationName}`}
      className={`rounded-2xl p-5 md:p-6 transition-all border shadow-sm ${
        isOverdue
          ? 'bg-white border-amber-400 shadow-amber-500/5'
          : 'bg-white border-slate-200 hover:border-teal-400'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
              isOverdue
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : isTaken
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-teal-50 text-teal-900 border border-teal-200'
            }`}
          >
            {isOverdue
              ? language === 'HI' ? 'समय बीत चुका है' : 'Overdue'
              : isTaken
              ? language === 'HI' ? 'पूर्ण' : 'Taken'
              : language === 'HI' ? 'अभी का समय' : 'Due Now'}
          </span>

          <span className="text-sm font-bold text-slate-600">
            {slot.scheduledTimeStr} {parseInt(slot.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}
          </span>
        </div>

        {/* Sarvam AI Audio Readout Button */}
        <button
          onClick={handleVoiceClick}
          disabled={isLoadingVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all active:scale-95 outline-none ${
            isSpeaking
              ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
              : isLoadingVoice
              ? 'bg-teal-50 text-teal-800 border-teal-300'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
          aria-label="Listen with Sarvam AI"
        >
          {isLoadingVoice ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
              <span>Generating Sarvam Voice...</span>
            </>
          ) : isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-red-600" />
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

      {/* Pill Illustration & Details */}
      <div className="py-4 flex items-center gap-5">
        <div className="shrink-0 text-center">
          <PillGraphic
            shape={visual.shape}
            color={visual.color}
            secondaryColor={visual.secondaryColor}
            size="md"
          />
          <div className="text-[11px] font-bold mt-1 text-slate-500 max-w-[90px] leading-tight">
            {language === 'HI' ? visual.colorLabelHindi : visual.colorLabelEnglish}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wide">
            {language === 'HI' ? visual.purposeLabelHindi : visual.purposeLabelEnglish}
          </div>

          <h2 className="text-xl md:text-2xl font-black text-slate-900 truncate mt-0.5">
            {language === 'HI' ? visual.purposeLabelHindi : slot.medicationName}
          </h2>

          <div className="text-xs font-semibold text-slate-500">
            {slot.medicationName} • {slot.dosage}
          </div>

          <p className="text-sm font-medium text-slate-700 mt-2 leading-relaxed">
            {language === 'HI' ? visual.instructionsHindi : visual.instructionsEnglish}
          </p>

          <div className="text-xs font-bold text-teal-800 mt-1.5">
            {language === 'HI' ? visual.mealTimingHindi : visual.mealTimingEnglish}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
        <button
          onClick={() => onTaken(slot)}
          disabled={isTaken}
          className={`min-h-[48px] text-base font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] outline-none shadow-sm ${
            isTaken
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
          }`}
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>{language === 'HI' ? 'दवाई ले ली' : 'I Took This Pill'}</span>
        </button>

        <button
          onClick={() => onSnooze(slot)}
          disabled={isTaken}
          className="min-h-[48px] text-xs md:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] outline-none border bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
        >
          <Clock className="w-4 h-4 text-slate-500" />
          <span>{language === 'HI' ? '३० मिनट बाद याद दिलाएं' : 'Remind in 30 Mins'}</span>
        </button>
      </div>
    </article>
  );
}
