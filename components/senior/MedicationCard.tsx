'use client';

import React from 'react';
import { Check, Clock, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { PillGraphic } from './PillGraphic';
import { TodayDoseSlot } from '@/lib/clinical/adherence-engine';

interface MedicationCardProps {
  slot: TodayDoseSlot;
  onTaken: (slot: TodayDoseSlot) => void;
  onSnooze: (slot: TodayDoseSlot) => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  voiceEngine?: string;
  language?: 'EN' | 'HI';
  highContrast?: boolean;
}

export function MedicationCard({
  slot,
  onTaken,
  onSnooze,
  onSpeak,
  isSpeaking,
  voiceEngine = 'Sarvam AI',
  language = 'HI',
  highContrast = false,
}: MedicationCardProps) {
  const isOverdue = slot.status === 'OVERDUE' || slot.status === 'MISSED';
  const isTaken = slot.status === 'ADMINISTERED';

  const visual = slot.visualIdentity || {
    shape: 'ROUND_TABLET' as const,
    color: '#FFFFFF',
    colorLabel: 'सफ़ेद गोल गोली (White Round Tablet)',
    purposeLabelHindi: 'दवा (Medication)',
    purposeLabelEnglish: 'Routine Dose',
    mealTimingHindi: 'पानी के साथ लें',
  };

  const speechText = language === 'HI'
    ? `सविता जी, यह आपकी ${visual.purposeLabelHindi} है। पहचान के लिए यह ${visual.colorLabel} है। ${slot.instructions}`
    : `Savita ji, this is your ${visual.purposeLabelEnglish}, ${slot.medicationName}. It looks like a ${visual.colorLabel}. Scheduled for ${slot.scheduledTimeStr}. ${slot.instructions}`;

  return (
    <article
      role="article"
      aria-label={`Medication ${slot.medicationName}`}
      className={`rounded-3xl p-6 md:p-10 transition-all relative overflow-hidden shadow-xl border-4 ${
        highContrast
          ? 'bg-black text-yellow-300 border-yellow-400'
          : isOverdue
          ? 'bg-white border-amber-500 shadow-amber-500/10'
          : 'bg-white border-teal-600 shadow-teal-500/10'
      }`}
    >
      {/* Header Status & Voice Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-xl text-sm md:text-base font-extrabold uppercase tracking-wide flex items-center gap-2 ${
              highContrast
                ? 'bg-yellow-400 text-black'
                : isOverdue
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : isTaken
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-teal-100 text-teal-900 border border-teal-200'
            }`}
          >
            {isOverdue && <AlertCircle className="w-5 h-5 text-amber-700" />}
            <span>
              {isOverdue
                ? language === 'HI' ? 'समय बीत गया है (Overdue)' : 'Overdue'
                : isTaken
                ? language === 'HI' ? 'पूर्ण (Taken)' : 'Taken'
                : language === 'HI' ? 'अभी लेने का समय' : 'Take Right Now'}
            </span>
          </span>

          <span className={`text-base md:text-lg font-black ${highContrast ? 'text-yellow-400' : 'text-slate-700'}`}>
            {slot.scheduledTimeStr} {parseInt(slot.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}
          </span>
        </div>

        {/* Sarvam AI Audio Readout Button */}
        <button
          onClick={() => onSpeak(speechText)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-black text-sm md:text-base border transition-all active:scale-95 outline-none focus:ring-4 ${
            isSpeaking
              ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
              : highContrast
              ? 'bg-yellow-400 text-black border-yellow-500'
              : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-200'
          }`}
          aria-label="Listen with Sarvam AI voice"
        >
          {isSpeaking ? <VolumeX className="w-5 h-5 text-red-600" /> : <Volume2 className="w-5 h-5 text-teal-700" />}
          <span>{isSpeaking ? 'बोलना बंद करें (Stop)' : 'बोलकर सुनें (Sarvam AI)'}</span>
        </button>
      </div>

      {/* Main Medication & Physical Pill Identifier Area */}
      <div className="py-6 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Realistic Visual Pill Graphic */}
        <div className="flex flex-col items-center gap-2 text-center shrink-0">
          <PillGraphic
            shape={visual.shape}
            color={visual.color}
            secondaryColor={visual.secondaryColor}
            size="lg"
          />
          <span className={`text-xs md:text-sm font-extrabold max-w-[140px] leading-tight ${
            highContrast ? 'text-yellow-400' : 'text-slate-600'
          }`}>
            {visual.colorLabel}
          </span>
        </div>

        {/* Medication Purpose & Instructions */}
        <div className="flex-1 text-center md:text-left">
          {/* Everyday Purpose in Large Font */}
          <div className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-800 mb-2">
            {visual.purposeLabelHindi} • {visual.purposeLabelEnglish}
          </div>

          <h2 className={`text-3xl md:text-5xl font-black tracking-tight leading-tight ${
            highContrast ? 'text-yellow-300' : 'text-slate-950'
          }`}>
            {language === 'HI' ? visual.purposeLabelHindi : slot.medicationName}
          </h2>

          <div className={`text-lg md:text-xl font-bold mt-1 ${highContrast ? 'text-yellow-400' : 'text-teal-700'}`}>
            {slot.medicationName} ({slot.dosage})
          </div>

          {/* Simple, Calm Routine Instruction Box */}
          <div className={`mt-5 p-4 md:p-5 rounded-2xl border-2 ${
            highContrast
              ? 'bg-zinc-950 border-yellow-400 text-yellow-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <p className="text-xl md:text-2xl font-bold leading-relaxed">
              {slot.instructions}
            </p>
            <p className={`text-base md:text-lg font-bold mt-2 ${highContrast ? 'text-yellow-300' : 'text-teal-900'}`}>
              👉 {visual.mealTimingHindi}
            </p>
          </div>
        </div>
      </div>

      {/* Massive 84px Touch-Target Action Buttons */}
      <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onTaken(slot)}
          disabled={isTaken}
          className={`w-full min-h-[76px] md:min-h-[84px] text-2xl md:text-3xl font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] outline-none focus:ring-4 shadow-xl ${
            highContrast
              ? 'bg-yellow-400 text-black border-4 border-yellow-500'
              : isTaken
              ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
          }`}
          aria-label={`Mark ${slot.medicationName} as taken`}
        >
          <Check className="w-9 h-9 stroke-[3]" />
          <span>{language === 'HI' ? 'मैंने यह दवाई ले ली' : 'I Took This Pill'}</span>
        </button>

        <button
          onClick={() => onSnooze(slot)}
          disabled={isTaken}
          className={`w-full min-h-[76px] md:min-h-[84px] text-xl md:text-2xl font-extrabold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] outline-none focus:ring-4 border-2 ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
          }`}
          aria-label="Snooze reminder for 30 minutes"
        >
          <Clock className="w-7 h-7 text-slate-600" />
          <span>{language === 'HI' ? '३० मिनट बाद याद दिलाएं' : 'Remind in 30 Mins'}</span>
        </button>
      </div>
    </article>
  );
}
