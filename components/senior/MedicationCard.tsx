'use client';

import React from 'react';
import { Check, Clock, Volume2, AlertTriangle, Sparkles, Utensils, Droplets } from 'lucide-react';
import { VoiceAnnouncer } from './VoiceAnnouncer';
import { ConfirmButton } from './ConfirmButton';
import { TodayDoseSlot } from '@/lib/clinical/adherence-engine';

interface MedicationCardProps {
  slot: TodayDoseSlot;
  onTaken: (slot: TodayDoseSlot) => void;
  onSnooze: (slot: TodayDoseSlot) => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  language?: 'EN' | 'HI';
  highContrast?: boolean;
}

export function MedicationCard({
  slot,
  onTaken,
  onSnooze,
  onSpeak,
  isSpeaking,
  language = 'EN',
  highContrast = false,
}: MedicationCardProps) {
  const isOverdue = slot.status === 'OVERDUE' || slot.status === 'MISSED';
  const isDue = slot.status === 'DUE';
  const isTaken = slot.status === 'ADMINISTERED';

  const speechText = language === 'HI'
    ? `सविता जी, आपकी दवाई ${slot.medicationName}, मात्रा ${slot.dosage} का समय हो गया है। निर्धारित समय ${slot.scheduledTimeStr} है। ${slot.instructions}`
    : `Savita ji, it is time for your medication ${slot.medicationName}, ${slot.dosage}. Scheduled for ${slot.scheduledTimeStr}. ${slot.instructions}`;

  return (
    <article
      role="article"
      aria-labelledby={`med-name-${slot.doseId}`}
      aria-describedby={`med-instructions-${slot.doseId}`}
      className={`rounded-3xl p-6 md:p-10 transition-all duration-200 relative overflow-hidden shadow-xl ${
        highContrast
          ? 'bg-black text-yellow-300 border-4 border-yellow-400'
          : isOverdue
          ? 'bg-amber-50/80 border-4 border-amber-500 text-slate-900 shadow-amber-500/10'
          : 'bg-white border-4 border-blue-600 text-slate-900 shadow-blue-500/10'
      }`}
    >
      {/* Top Banner & Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <span
          className={`px-4 py-1.5 rounded-full text-sm md:text-base font-black tracking-wide uppercase flex items-center gap-2 ${
            highContrast
              ? 'bg-yellow-400 text-black'
              : isOverdue
              ? 'bg-amber-600 text-white animate-pulse'
              : isTaken
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {isOverdue && <AlertTriangle className="w-5 h-5" />}
          {isOverdue
            ? language === 'HI' ? '⚠️ समय बीत चुका है (Overdue)' : '⚠️ Dose Overdue'
            : isTaken
            ? language === 'HI' ? '✓ ली जा चुकी है (Taken)' : '✓ Administered'
            : language === 'HI' ? '⏰ अभी लेने का समय (Take Now)' : '⏰ Up Next Right Now'}
        </span>

        {/* Voice Announcer Button */}
        <VoiceAnnouncer
          isSpeaking={isSpeaking}
          onSpeak={() => onSpeak(speechText)}
          label={language === 'HI' ? 'आवाज़ में सुनें (Listen)' : 'Read Aloud'}
        />
      </div>

      {/* Medication Name & Dosage */}
      <div className="mt-2">
        <h2
          id={`med-name-${slot.doseId}`}
          className={`text-3xl md:text-5xl font-black tracking-tight leading-tight ${
            highContrast ? 'text-yellow-300' : 'text-slate-950'
          }`}
        >
          {slot.medicationName}
          <span className="sr-only"> — {slot.dosage}</span>
        </h2>

        <div className={`text-xl md:text-2xl font-black mt-2 flex items-center gap-3 ${
          highContrast ? 'text-yellow-400' : 'text-blue-700'
        }`}>
          <span>{slot.dosage}</span>
          <span>•</span>
          <span>⏰ {slot.scheduledTimeStr} {parseInt(slot.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
        </div>

        {/* Instructions Box */}
        <div
          className={`mt-6 p-4 md:p-6 rounded-2xl border-2 ${
            highContrast
              ? 'bg-zinc-950 border-yellow-400 text-yellow-200'
              : 'bg-blue-50/80 border-blue-200 text-slate-800'
          }`}
        >
          <p
            id={`med-instructions-${slot.doseId}`}
            className="text-lg md:text-2xl font-bold leading-relaxed"
          >
            💡 {slot.instructions}
          </p>

          {slot.foodRelation === 'WITH_MEAL' && (
            <div className={`mt-3 flex items-center gap-2 text-base md:text-lg font-bold ${
              highContrast ? 'text-yellow-300' : 'text-blue-900'
            }`}>
              <Utensils className="w-5 h-5 text-amber-600" />
              <span>{language === 'HI' ? 'नाश्ते या खाने के साथ लें (Take with meals)' : 'Best taken with meals/breakfast.'}</span>
            </div>
          )}

          {slot.foodRelation === 'BEFORE_MEAL' && (
            <div className={`mt-3 flex items-center gap-2 text-base md:text-lg font-bold ${
              highContrast ? 'text-yellow-300' : 'text-indigo-900'
            }`}>
              <Droplets className="w-5 h-5 text-indigo-600" />
              <span>{language === 'HI' ? 'सुबह खाली पेट लें - खाने से ३० मिनट पहले (Empty stomach before breakfast)' : 'Take on an empty stomach 30 mins before breakfast.'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons with 72px+ touch targets */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConfirmButton
          onClick={() => onTaken(slot)}
          ariaLabel={`Mark ${slot.medicationName} as taken`}
          variant="primary"
        >
          <Check className="w-8 h-8 stroke-[3]" />
          <span>{language === 'HI' ? 'मैंने दवाई ले ली' : 'I Took This Pill'}</span>
        </ConfirmButton>

        <ConfirmButton
          onClick={() => onSnooze(slot)}
          ariaLabel={`Snooze ${slot.medicationName} reminder for 30 minutes`}
          variant="secondary"
        >
          <Clock className="w-7 h-7" />
          <span>{language === 'HI' ? '३० मिनट बाद याद दिलाएं' : 'Remind in 30 Mins'}</span>
        </ConfirmButton>
      </div>
    </article>
  );
}
