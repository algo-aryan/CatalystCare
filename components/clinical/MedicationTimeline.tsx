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
    <div className="space-y-4">
      {schedule.map((slot) => {
        return (
          <div
            key={slot.doseId}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="font-mono text-base font-black bg-blue-50 text-blue-900 border border-blue-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{slot.scheduledTimeStr}</span>
              </div>

              <div>
                <div className="font-extrabold text-slate-900 text-lg flex items-center gap-2 flex-wrap">
                  <span>{slot.medicationName}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {slot.dosage}
                  </span>
                  {slot.isCritical && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 uppercase">
                      Critical Med
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-medium">{slot.instructions}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AlertBadge status={slot.status} isCritical={slot.isCritical} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
