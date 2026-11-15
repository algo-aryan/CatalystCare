import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dispatchEmail } from '@/lib/notifications/notifier';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || 'patient_eleanor_vance';
  const appointments = db.getAppointments(patientId);
  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doctorName, specialty, clinicHospital, appointmentTime, contactNumber, reason, notes, patientId } = body;

    if (!doctorName || !appointmentTime || !clinicHospital) {
      return NextResponse.json({ error: 'Doctor name, appointment date/time, and clinic are required.' }, { status: 400 });
    }

    const patient = db.getPatientProfile();
    const appt = db.addAppointment({
      patientId: patientId || patient.id,
      doctorName,
      specialty: specialty || 'General Medicine',
      clinicHospital,
      appointmentTime,
      contactNumber: contactNumber || '+1-555-000-1122',
      reason: reason || 'Routine clinical follow-up',
      notes,
      status: 'SCHEDULED',
    });

    // Proactively dispatch appointment notification to patient and caretakers
    const timeFormatted = new Date(appointmentTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const user = db.getUserById(patient.userId);
    if (user) {
      const html = `
        <div style="font-family: sans-serif; padding: 24px; border: 2px solid #1D4ED8; border-radius: 12px; max-width: 550px;">
          <h2 style="color: #1D4ED8; margin-top: 0;">📅 Doctor Appointment Confirmed</h2>
          <p>Hello <strong>${patient.fullName}</strong>,</p>
          <p>Your upcoming medical visit has been scheduled:</p>
          <div style="background: #EFF6FF; padding: 16px; border-radius: 8px;">
            <p><strong>Doctor:</strong> ${doctorName} (${specialty})</p>
            <p><strong>Clinic:</strong> ${clinicHospital}</p>
            <p><strong>Date & Time:</strong> ${timeFormatted}</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #64748B;">
            CatalystCare Medical Coordination • Your caregiver Marcus Vance has been notified.
          </p>
        </div>
      `;

      await dispatchEmail({
        to: user.email,
        subject: `📅 Appointment Scheduled: ${doctorName} on ${timeFormatted}`,
        html,
        type: 'APPOINTMENT_REMINDER',
        patientId: patient.id,
      });
    }

    return NextResponse.json({ success: true, appointment: appt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }

    const updated = db.updateAppointment(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }

    const appts = db.getAppointments();
    const appt = appts.find((a) => a.id === id);
    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    db.updateAppointment(id, { status: 'CANCELLED' });
    return NextResponse.json({ success: true, message: 'Appointment marked as cancelled' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
