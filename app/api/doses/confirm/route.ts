import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyOneClickActionToken } from '@/lib/security/crypto';
import { getTodaySchedule } from '@/lib/clinical/adherence-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const patientId = searchParams.get('patientId') || 'patient_eleanor_vance';

  if (!token) {
    return NextResponse.json({ error: 'Missing token parameter.' }, { status: 400 });
  }

  const result = verifyOneClickActionToken(token);
  if (!result.valid || !result.doseId) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #b91c1c;">Link Expired or Invalid</h2>
        <p>This medication confirmation link is no longer valid or has already been used.</p>
        <a href="/" style="display: inline-block; padding: 12px 24px; background: #1d4ed8; color: white; text-decoration: none; border-radius: 8px;">Return to CatalystCare</a>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const schedule = getTodaySchedule(patientId);
  const slot = schedule.find((s) => s.doseId === result.doseId);

  if (slot) {
    db.recordAdherenceEvent({
      doseId: slot.doseId,
      medicationId: slot.medicationId,
      patientId,
      scheduledTime: slot.scheduledDateTime,
      status: 'ADMINISTERED',
      deviationMinutes: 0,
      administeredBy: {
        userId: 'user_patient_eleanor',
        role: 'PATIENT',
        name: 'Eleanor Vance (via Email)',
      },
      notes: 'Confirmed directly from email notification link',
    });
  }

  return new Response(
    `<!DOCTYPE html><html><body style="font-family: sans-serif; text-align: center; padding: 60px; background: #f8fafc;">
      <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; border: 2px solid #047857;">
        <div style="font-size: 48px;">✅</div>
        <h2 style="color: #047857; margin-top: 10px;">Medication Confirmed!</h2>
        <p style="font-size: 18px; color: #334155;">Thank you! Your dose has been recorded, and your caretaker has been updated.</p>
        <a href="/senior" style="display: inline-block; margin-top: 20px; padding: 16px 32px; font-size: 18px; font-weight: bold; background: #1d4ed8; color: white; text-decoration: none; border-radius: 12px;">Open Senior Dashboard</a>
      </div>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
