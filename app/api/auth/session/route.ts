import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const users = db.getUsers();
  const patient = db.getPatientProfile();
  const relationships = db.getCareRelationships();

  return NextResponse.json({
    users,
    patient,
    relationships,
  });
}
