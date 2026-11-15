import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTodaySchedule, calculateAdherenceMetrics } from '@/lib/clinical/adherence-engine';
import { sendDoseReminderEmail, sendCriticalEscalationEmail } from '@/lib/notifications/notifier';

export async function POST(request: Request) {
  try {
    const patientId = 'patient_eleanor_vance';
    const patient = db.getPatientProfile();
    const patientUser = db.getUserById(patient.userId);
    const relationships = db.getCareRelationships().filter((r) => r.patientId === patientId && r.status === 'ACTIVE');

    const schedule = getTodaySchedule(patientId);
    const metrics = calculateAdherenceMetrics(patientId);

    const triggeredAlerts: string[] = [];

    for (const slot of schedule) {
      if (slot.status === 'DUE' || slot.status === 'UPCOMING') {
        if (patientUser) {
          await sendDoseReminderEmail(
            patientUser.email,
            patient.fullName,
            slot.medicationName,
            slot.dosage,
            slot.scheduledTimeStr,
            slot.instructions,
            slot.doseId,
            patientId
          );
          triggeredAlerts.push(`Reminder sent to ${patient.fullName} for ${slot.medicationName}`);
        }
      }

      if (slot.isCritical && (slot.status === 'OVERDUE' || slot.status === 'MISSED')) {
        for (const rel of relationships) {
          const caregiverUser = db.getUserById(rel.caregiverUserId);
          const email = caregiverUser?.email || (rel.role === 'CARETAKER' ? 'marcus.vance@gmail.com' : 'sarah.vance@outlook.com');

          await sendCriticalEscalationEmail(
            email,
            rel.caregiverName,
            patient.fullName,
            slot.medicationName,
            slot.dosage,
            slot.scheduledTimeStr,
            patientId
          );
          triggeredAlerts.push(`Urgent escalation sent to ${rel.caregiverName} (${rel.role}) for ${slot.medicationName}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      scannedDosesCount: schedule.length,
      triggeredAlerts,
      metrics,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
