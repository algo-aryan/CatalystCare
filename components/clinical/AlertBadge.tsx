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
      bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: Check,
      text: 'TAKEN ON TIME',
    },
    LATE: {
      bg: 'bg-blue-100 text-blue-900 border-blue-300',
      icon: Check,
      text: 'TAKEN LATE',
    },
    DUE: {
      bg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: Clock,
      text: 'DUE NOW',
    },
    UPCOMING: {
      bg: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: Clock,
      text: 'UPCOMING',
    },
    OVERDUE: {
      bg: 'bg-orange-100 text-orange-900 border-orange-300',
      icon: AlertTriangle,
      text: isCritical ? '⚠️ CRITICAL OVERDUE' : 'OVERDUE',
    },
    MISSED: {
      bg: 'bg-red-100 text-red-900 border-red-300',
      icon: XCircle,
      text: isCritical ? '🚨 CRITICAL MISSED' : 'MISSED',
    },
    SNOOZED: {
      bg: 'bg-purple-100 text-purple-900 border-purple-300',
      icon: Clock,
      text: 'SNOOZED',
    },
    SCHEDULED: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock,
      text: 'SCHEDULED',
    },
  }[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
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
