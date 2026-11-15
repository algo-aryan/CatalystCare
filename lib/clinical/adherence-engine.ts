import { Medication, AdherenceEvent, DoseStatus } from '@/types';
import { db } from '../db';

export interface TodayDoseSlot {
  doseId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  foodRelation: string;
  form: string;
  isCritical: boolean;
  scheduledTimeStr: string; // "08:00"
  scheduledDateTime: string; // ISO
  status: DoseStatus;
  administeredAt?: string;
  deviationMinutes?: number;
  snoozedUntil?: string;
}

export interface AdherenceMetrics {
  overallPercentage: number;
  totalScheduledPast7Days: number;
  totalAdministeredPast7Days: number;
  totalMissedPast7Days: number;
  currentStreakDays: number;
  criticalMissesDetected: boolean;
  activeEscalationTier: 0 | 1 | 2 | 3; // 0=None, 1=Patient, 2=Caretaker, 3=Emergency Family
}

/**
 * Computes live dose status based on current time vs scheduled time and past logs
 */
export function computeDoseStatus(scheduledIso: string, event?: AdherenceEvent): DoseStatus {
  if (event) {
    return event.status;
  }

  const now = Date.now();
  const scheduledTime = new Date(scheduledIso).getTime();
  const diffMinutes = Math.round((now - scheduledTime) / (1000 * 60));

  if (diffMinutes < -30) {
    return 'UPCOMING';
  } else if (diffMinutes >= -30 && diffMinutes <= 30) {
    return 'DUE';
  } else if (diffMinutes > 30 && diffMinutes <= 120) {
    return 'OVERDUE';
  } else {
    return 'MISSED';
  }
}

/**
 * Builds the chronological schedule for today
 */
export function getTodaySchedule(patientId: string): TodayDoseSlot[] {
  const medications = db.getMedications(true).filter((m) => m.patientId === patientId);
  const events = db.getAdherenceEvents(patientId);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const slots: TodayDoseSlot[] = [];

  for (const med of medications) {
    for (const timeStr of med.scheduledTimes) {
      const scheduledDateTime = `${todayStr}T${timeStr}:00.000Z`;
      const doseId = `dose_${todayStr}_${med.id}_${timeStr.replace(':', '')}`;

      // Check if an adherence event has been logged for this dose slot
      const existingEvent = events.find((e) => e.doseId === doseId || (e.medicationId === med.id && e.scheduledTime.startsWith(todayStr) && e.scheduledTime.includes(timeStr)));

      const status = computeDoseStatus(scheduledDateTime, existingEvent);

      slots.push({
        doseId,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        instructions: med.instructions,
        foodRelation: med.foodRelation,
        form: med.form,
        isCritical: med.isCritical,
        scheduledTimeStr: timeStr,
        scheduledDateTime,
        status,
        administeredAt: existingEvent?.recordedAt,
        deviationMinutes: existingEvent?.deviationMinutes,
      });
    }
  }

  // Sort chronologically by scheduled time
  return slots.sort((a, b) => a.scheduledTimeStr.localeCompare(b.scheduledTimeStr));
}

/**
 * Calculates rolling 7-day adherence metrics and checks escalation status
 */
export function calculateAdherenceMetrics(patientId: string): AdherenceMetrics {
  const events = db.getAdherenceEvents(patientId);
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86400000;

  const past7DaysEvents = events.filter((e) => new Date(e.scheduledTime).getTime() >= sevenDaysAgo);

  const totalAdministered = past7DaysEvents.filter((e) => e.status === 'ADMINISTERED' || e.status === 'LATE').length;
  const totalMissed = past7DaysEvents.filter((e) => e.status === 'MISSED' || e.status === 'OVERDUE').length;
  const totalDoses = past7DaysEvents.length;

  const overallPercentage = totalDoses > 0 ? Math.round((totalAdministered / totalDoses) * 100) : 100;

  // Streak calculation (days with 100% adherence going backwards)
  let currentStreak = 0;
  for (let d = 1; d <= 30; d++) {
    const dayStr = new Date(now - d * 86400000).toISOString().split('T')[0];
    const dayEvents = events.filter((e) => e.scheduledTime.startsWith(dayStr));
    if (dayEvents.length === 0) continue;

    const allTaken = dayEvents.every((e) => e.status === 'ADMINISTERED' || e.status === 'LATE');
    if (allTaken) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Escalation detection: Check today's overdue/missed critical doses
  const todaySlots = getTodaySchedule(patientId);
  const overdueCritical = todaySlots.filter((s) => s.isCritical && (s.status === 'OVERDUE' || s.status === 'MISSED'));

  let activeTier: 0 | 1 | 2 | 3 = 0;
  let criticalMisses = false;

  if (overdueCritical.length >= 2) {
    activeTier = 3; // Emergency escalation to Family & Caretaker
    criticalMisses = true;
  } else if (overdueCritical.length === 1) {
    activeTier = 2; // Caretaker alert
    criticalMisses = true;
  } else {
    const anyOverdue = todaySlots.some((s) => s.status === 'OVERDUE');
    if (anyOverdue) {
      activeTier = 1; // Patient gentle reminder
    }
  }

  return {
    overallPercentage,
    totalScheduledPast7Days: totalDoses,
    totalAdministeredPast7Days: totalAdministered,
    totalMissedPast7Days: totalMissed,
    currentStreakDays: currentStreak,
    criticalMissesDetected: criticalMisses,
    activeEscalationTier: activeTier,
  };
}
