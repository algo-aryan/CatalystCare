import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateCareLinkCode, signCareLinkCode } from '@/lib/security/crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetRole, patientId, permissions } = body;

    const patient = db.getPatientProfile();
    const resolvedPatientId = patientId || patient.id;
    const role = targetRole === 'FAMILY_MEMBER' ? 'FAMILY_MEMBER' : 'CARETAKER';

    const code = generateCareLinkCode();
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24 hours
    const signature = signCareLinkCode(code, resolvedPatientId, role, expiresAt);

    const defaultPermissions = role === 'CARETAKER'
      ? {
          canAdministerMeds: true,
          canEditSchedule: true,
          canViewAuditLog: true,
          canManageAppointments: true,
          receiveEmergencyAlerts: true,
        }
      : {
          canAdministerMeds: false,
          canEditSchedule: false,
          canViewAuditLog: true,
          canManageAppointments: false,
          receiveEmergencyAlerts: true,
        };

    const careToken = {
      token: code,
      signature,
      patientId: resolvedPatientId,
      targetRole: role as 'CARETAKER' | 'FAMILY_MEMBER',
      permissions: permissions || defaultPermissions,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    };

    db.createCareLinkToken(careToken);

    return NextResponse.json({
      success: true,
      token: code,
      expiresAt,
      targetRole: role,
      instructions: `Share this 6-character code [${code}] with your ${role === 'CARETAKER' ? 'caretaker/nurse' : 'family member'}. Valid for 24 hours.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error generating CareLink code';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
