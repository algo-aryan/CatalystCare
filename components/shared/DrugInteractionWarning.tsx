'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { DrugInteractionReport } from '@/types';

interface DrugInteractionWarningProps {
  warnings: DrugInteractionReport[];
}

export function DrugInteractionWarning({ warnings }: DrugInteractionWarningProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div
      role="alert"
      className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3"
    >
      <div className="flex items-center gap-2 text-sm font-extrabold text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <span>Gemini AI Safety: Clinical Drug Interaction Warning</span>
      </div>

      <div className="space-y-2">
        {warnings.map((w, idx) => {
          const isContraindicated = w.severity === 'CONTRAINDICATED' || w.severity === 'HIGH';
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                isContraindicated
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-100/60 border-amber-200 text-amber-950'
              }`}
            >
              <div className="font-extrabold flex items-center justify-between">
                <span>
                  {w.drugA} ↔ {w.drugB}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    isContraindicated ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {w.severity}
                </span>
              </div>
              <p className="mt-1 font-medium">{w.clinicalEffect}</p>
              <p className="mt-1 font-bold">💡 Recommendation: {w.recommendation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
