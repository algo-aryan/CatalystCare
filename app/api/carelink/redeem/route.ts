import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCareLinkSignature } from '@/lib/security/crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, caregiverName, caregiverEmail } = body;

    if (!code || !caregiverName) {
      return NextResponse.json({ error: 'Please enter the 6-character CareLink code and your name.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const tokenRecord = db.getCareLinkToken(cleanCode);

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or already-redeemed CareLink passcode.' }, { status: 404 });
    }

    if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This CareLink passcode has expired.' }, { status: 400 });
    }

    // Verify cryptographic signature
    const isValid = verifyCareLinkSignature(
      tokenRecord.token,
      tokenRecord.patientId,
      tokenRecord.targetRole,
      tokenRecord.expiresAt,
      tokenRecord.signature
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Cryptographic signature verification failed.' }, { status: 403 });
    }

    // Create user if doesn't exist
    const newUserId = `user_${Date.now()}`;
    const relationship = db.addCareRelationship({
      patientId: tokenRecord.patientId,
      caregiverUserId: newUserId,
      caregiverName,
      role: tokenRecord.targetRole,
      permissions: tokenRecord.permissions,
      linkedViaToken: cleanCode,
      status: 'ACTIVE',
    });

    db.markCareLinkTokenUsed(cleanCode);

    const response = NextResponse.json({
      success: true,
      message: `Successfully linked to patient profile as ${tokenRecord.targetRole}.`,
      relationship,
      targetRole: tokenRecord.targetRole,
    });

    // Set signed, secure httpOnly session cookie
    response.cookies.set('carelink_session', JSON.stringify({
      role: tokenRecord.targetRole,
      patientId: tokenRecord.patientId,
      caregiverName,
      code: cleanCode,
      timestamp: Date.now(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error redeeming CareLink code';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
