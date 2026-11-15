'use client';

import React from 'react';
import { DoseStatus } from '@/types';
import { Check, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface AlertBadgeProps {
  status: DoseStatus;
  isCritical?: boolean;
}

export function AlertBadge({ status, isCritical }: AlertBadgeProps) {
  // Triple-encoded status: Shape (Icon) + Text (Label) + Color
  // Ensures 100% accessibility for colorblind individuals (protanopia/deuteranopia)
  const config = {
    ADMINISTERED: {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
      icon: Check,
      text: 'Taken',
    },
    LATE: {
      bg: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: Check,
      text: 'Taken Late',
    },
    DUE: {
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      icon: Clock,
      text: 'Due',
    },
    UPCOMING: {
      bg: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: Clock,
      text: 'Scheduled',
    },
    OVERDUE: {
      bg: 'bg-rose-50 text-rose-900 border-rose-200',
      icon: AlertTriangle,
      text: isCritical ? 'Attention Required' : 'Overdue',
    },
    MISSED: {
      bg: 'bg-rose-50 text-rose-900 border-rose-200',
      icon: XCircle,
      text: isCritical ? 'Attention Required' : 'Missed',
    },
    SNOOZED: {
      bg: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: Clock,
      text: 'Snoozed',
    },
    SCHEDULED: {
      bg: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: Clock,
      text: 'Scheduled',
    },
  }[status] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Clock,
    text: status,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
      <span>{config.text}</span>
    </span>
  );
}
