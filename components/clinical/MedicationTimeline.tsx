'use client';

import React from 'react';
import { TodayDoseSlot } from '@/lib/clinical/adherence-engine';
import { AlertBadge } from './AlertBadge';
import { Clock } from 'lucide-react';

interface MedicationTimelineProps {
  schedule: TodayDoseSlot[];
}

export function MedicationTimeline({ schedule }: MedicationTimelineProps) {
  if (schedule.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        No scheduled medications found for today.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedule.map((slot) => {
        return (
          <div
            key={slot.doseId}
            className="p-4 md:p-5 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="font-mono text-sm font-bold bg-slate-50 text-slate-800 border border-slate-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>{slot.scheduledTimeStr} {parseInt(slot.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
              </div>

              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-base flex items-center gap-2 flex-wrap">
                  <span className="truncate">{slot.medicationName}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {slot.dosage}
                  </span>
                  {slot.isCritical && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 uppercase">
                      Critical
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{slot.instructions}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <AlertBadge status={slot.status} isCritical={slot.isCritical} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
