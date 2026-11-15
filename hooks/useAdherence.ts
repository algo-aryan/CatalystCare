'use client';

import { useState, useEffect, useCallback } from 'react';
import { TodayDoseSlot, AdherenceMetrics } from '@/lib/clinical/adherence-engine';

export function useAdherence(patientId: string = 'patient_savita_sharma') {
  const [schedule, setSchedule] = useState<TodayDoseSlot[]>([]);
  const [metrics, setMetrics] = useState<AdherenceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch(`/api/doses?patientId=${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setSchedule(data.schedule || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error('[useAdherence] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(fetchSchedule, 15000);
    return () => clearInterval(interval);
  }, [fetchSchedule]);

  const confirmDose = useCallback(
    async (slot: TodayDoseSlot, status: 'ADMINISTERED' | 'SNOOZED', notes?: string) => {
      // Optimistic update
      setSchedule((prev) =>
        prev.map((s) => (s.doseId === slot.doseId ? { ...s, status } : s))
      );

      try {
        await fetch('/api/doses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doseId: slot.doseId,
            medicationId: slot.medicationId,
            patientId,
            scheduledDateTime: slot.scheduledDateTime,
            status,
            actorName: 'Savita Sharma',
            actorRole: 'PATIENT',
            actorUserId: 'user_patient_savita',
            notes,
          }),
        });
        await fetchSchedule();
      } catch (err) {
        console.error('[useAdherence] Error confirming dose:', err);
      }
    },
    [patientId, fetchSchedule]
  );

  const untakenSlots = schedule.filter((s) => s.status !== 'ADMINISTERED');
  const nextDueSlot = 
    untakenSlots.find((s) => s.status === 'DUE' || s.status === 'OVERDUE') ||
    untakenSlots.find((s) => s.status === 'MISSED') ||
    untakenSlots.find((s) => s.status === 'UPCOMING') ||
    untakenSlots[0] ||
    null;

  return {
    schedule,
    metrics,
    loading,
    refresh: fetchSchedule,
    confirmDose,
    nextDueSlot,
    takenCount: schedule.filter((s) => s.status === 'ADMINISTERED').length,
    totalCount: schedule.length,
  };
}
