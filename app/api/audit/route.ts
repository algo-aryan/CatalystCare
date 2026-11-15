import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { computeAuditHash } from '@/lib/security/crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || 'patient_eleanor_vance';
  const logs = db.getAuditLogs(patientId);

  // Perform cryptographic integrity verification over the chain
  let chainIntact = true;
  for (let i = logs.length - 1; i >= 0; i--) {
    const entry = logs[i];
    const recomputed = computeAuditHash(
      entry.previousHash,
      entry.timestamp,
      entry.actorUserId,
      entry.action,
      entry.details
    );
    if (recomputed !== entry.hash) {
      chainIntact = false;
      break;
    }
  }

  return NextResponse.json({
    logs,
    totalCount: logs.length,
    chainIntegrityVerified: chainIntact,
  });
}
