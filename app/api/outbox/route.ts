import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || 'patient_eleanor_vance';
  const emails = db.getOutboxEmails(patientId);
  return NextResponse.json({ emails, count: emails.length });
}
