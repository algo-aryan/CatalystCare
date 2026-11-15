import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTodaySchedule, calculateAdherenceMetrics } from '@/lib/clinical/adherence-engine';
import { verifyOneClickActionToken } from '@/lib/security/crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || 'patient_eleanor_vance';
  
  // Check if a one-click confirmation token is passed via GET (from email link)
  const token = searchParams.get('token');
  if (token) {
    const verified = verifyOneClickActionToken(token);
    if (!verified.valid || !verified.doseId) {
      return NextResponse.json({ error: 'Invalid or expired one-click confirmation token.' }, { status: 400 });
    }

    // Find the dose slot to determine medication
    const schedule = getTodaySchedule(patientId);
    const targetSlot = schedule.find((s) => s.doseId === verified.doseId);

    if (targetSlot) {
      db.recordAdherenceEvent({
        doseId: targetSlot.doseId,
        medicationId: targetSlot.medicationId,
        patientId,
        scheduledTime: targetSlot.scheduledDateTime,
        status: 'ADMINISTERED',
        deviationMinutes: 0,
        administeredBy: {
          userId: 'user_patient_eleanor',
          role: 'PATIENT',
          name: 'Eleanor Vance (via 1-Click Email)',
        },
        notes: 'Confirmed directly from email notification',
      });
    }

    // Redirect to senior dashboard with success parameter
    return NextResponse.redirect(new URL('/senior?confirmed=true', request.url));
  }

  const schedule = getTodaySchedule(patientId);
  const metrics = calculateAdherenceMetrics(patientId);

  return NextResponse.json({
    schedule,
    metrics,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doseId, medicationId, patientId, scheduledDateTime, status, actorName, actorRole, actorUserId, notes } = body;

    if (!doseId || !medicationId || !patientId || !status) {
      return NextResponse.json({ error: 'Missing required dose confirmation fields.' }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledDateTime || Date.now());
    const deviationMinutes = Math.round((Date.now() - scheduledDate.getTime()) / (1000 * 60));

    const event = db.recordAdherenceEvent({
      doseId,
      medicationId,
      patientId,
      scheduledTime: scheduledDateTime || new Date().toISOString(),
      status: status as any,
      deviationMinutes,
      administeredBy: {
        userId: actorUserId || 'user_patient_eleanor',
        role: actorRole || 'PATIENT',
        name: actorName || 'Eleanor Vance',
      },
      notes,
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
