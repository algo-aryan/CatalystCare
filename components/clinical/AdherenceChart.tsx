'use client';

import React from 'react';
import { AdherenceMetrics } from '@/lib/clinical/adherence-engine';
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface AdherenceChartProps {
  metrics: AdherenceMetrics | null;
}

export function AdherenceChart({ metrics }: AdherenceChartProps) {
  if (!metrics) return null;

  // Mock past 7 days data for visual graph
  const days = [
    { day: 'Mon', percentage: 100, taken: 4, total: 4 },
    { day: 'Tue', percentage: 100, taken: 4, total: 4 },
    { day: 'Wed', percentage: 75, taken: 3, total: 4 }, // 1 missed
    { day: 'Thu', percentage: 100, taken: 4, total: 4 },
    { day: 'Fri', percentage: 100, taken: 4, total: 4 },
    { day: 'Sat', percentage: 100, taken: 4, total: 4 },
    { day: 'Today', percentage: metrics.overallPercentage, taken: metrics.totalAdministeredPast7Days, total: metrics.totalScheduledPast7Days },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            Adherence Analytics
          </div>
          <h3 className="text-xl font-bold text-slate-900">7-Day Adherence Trajectory</h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>Adherence $\ge$ 90%</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>Review &lt; 90%</span>
          </div>
        </div>
      </div>

      {/* Visual Chart Bars */}
      <div className="grid grid-cols-7 gap-3 items-end h-44 pt-6 pb-2 border-b border-slate-100">
        {days.map((item, idx) => {
          const isHigh = item.percentage >= 90;
          return (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[11px] font-bold text-slate-700">{item.percentage}%</span>
              <div
                style={{ height: `${Math.max(item.percentage, 15)}%` }}
                className={`w-full max-w-[48px] rounded-t-xl transition-all ${
                  isHigh ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                }`}
                title={`${item.day}: ${item.percentage}% (${item.taken}/${item.total})`}
              />
              <span className="text-xs font-bold text-slate-600 mt-1">{item.day}</span>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>
            Rolling 7-day adherence: <strong>{metrics.overallPercentage}%</strong>
          </span>
        </div>
        <div>
          Current streak: <strong>{metrics.currentStreakDays} days</strong> on schedule
        </div>
      </div>
    </div>
  );
}
