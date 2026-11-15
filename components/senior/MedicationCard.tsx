'use client';

import React from 'react';
import { Check, Clock } from 'lucide-react';
import { VoiceAnnouncer } from './VoiceAnnouncer';
import { ConfirmButton } from './ConfirmButton';
import { TodayDoseSlot } from '@/lib/clinical/adherence-engine';

interface MedicationCardProps {
  slot: TodayDoseSlot;
  onTaken: (slot: TodayDoseSlot) => void;
  onSnooze: (slot: TodayDoseSlot) => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

export function MedicationCard({
  slot,
  onTaken,
  onSnooze,
  onSpeak,
  isSpeaking,
}: MedicationCardProps) {
  const isOverdue = slot.status === 'OVERDUE' || slot.status === 'MISSED';

  return (
    <article
      role="article"
      aria-labelledby={`med-name-${slot.doseId}`}
      aria-describedby={`med-instructions-${slot.doseId}`}
      className="bg-white rounded-3xl p-6 md:p-10 border-4 border-blue-600 shadow-2xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="bg-blue-600 text-white text-base md:text-lg font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
          {isOverdue ? '⚠️ Dose Overdue' : '⏰ Up Next Right Now'}
        </span>

        <VoiceAnnouncer
          isSpeaking={isSpeaking}
          onSpeak={() =>
            onSpeak(
              `It is time for ${slot.medicationName}, ${slot.dosage}. Scheduled for ${slot.scheduledTimeStr}. ${slot.instructions}.`
            )
          }
        />
      </div>

      <div className="mt-2">
        <h2 id={`med-name-${slot.doseId}`} className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
          {slot.medicationName}
          <span className="sr-only"> — {slot.dosage}</span>
        </h2>
        <div className="text-2xl md:text-3xl font-bold text-blue-800 mt-2">
          {slot.dosage} • At {slot.scheduledTimeStr}
        </div>

        <div className="mt-6 p-4 md:p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <p id={`med-instructions-${slot.doseId}`} className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed">
            💡 {slot.instructions}
          </p>
          {slot.foodRelation === 'WITH_MEAL' && (
            <p className="text-base text-blue-800 mt-2 font-medium">
              🍽️ Best taken with food or breakfast.
            </p>
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
          <span>I Took This Pill</span>
        </ConfirmButton>

        <ConfirmButton
          onClick={() => onSnooze(slot)}
          ariaLabel={`Snooze ${slot.medicationName} reminder for 30 minutes`}
          variant="secondary"
        >
          <Clock className="w-7 h-7" />
          <span>Remind in 30 Mins</span>
        </ConfirmButton>
      </div>
    </article>
  );
}
