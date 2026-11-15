import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('carelink_session')?.value;

  let authenticated = false;
  let sessionData: any = null;

  if (sessionCookie) {
    try {
      sessionData = JSON.parse(sessionCookie);
      if (sessionData && sessionData.role && sessionData.patientId) {
        authenticated = true;
      }
    } catch {}
  }

  const users = db.getUsers();
  const patient = db.getPatientProfile();
  const relationships = db.getCareRelationships();

  return NextResponse.json({
    authenticated,
    session: sessionData,
    users,
    patient,
    relationships,
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Signed out of CareLink session' });
  response.cookies.delete('carelink_session');
  return response;
}
