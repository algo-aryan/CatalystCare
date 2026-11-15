import crypto from 'crypto';

const HMAC_SECRET = process.env.CARELINK_HMAC_SECRET || 'carelink_token_cryptographic_secret_key_9988!';
const ONE_CLICK_SECRET = process.env.SESSION_SECRET || 'catalystcare_one_click_action_token_secret!';

// 32-character phonetically and visually unambiguous character set
// Excludes 0 (zero), O (capital O), 1 (one), I (capital I), L (capital L)
const UNAMBIGUOUS_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generates an elderly-friendly 6-character CareLink pairing token.
 * Easy to read aloud over phone or copy.
 */
export function generateCareLinkCode(): string {
  const bytes = crypto.randomBytes(6);
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += UNAMBIGUOUS_CHARSET[bytes[i] % UNAMBIGUOUS_CHARSET.length];
  }
  return result;
}

/**
 * Cryptographically signs a CareLink code with HMAC-SHA256.
 */
export function signCareLinkCode(code: string, patientId: string, role: string, expiresAt: string): string {
  const payload = `${code}:${patientId}:${role}:${expiresAt}`;
  return crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
}

/**
 * Validates a CareLink code signature using constant-time comparison to prevent timing attacks.
 */
export function verifyCareLinkSignature(
  code: string,
  patientId: string,
  role: string,
  expiresAt: string,
  signature: string
): boolean {
  try {
    const expected = signCareLinkCode(code, patientId, role, expiresAt);
    const expectedBuf = Buffer.from(expected, 'hex');
    const signatureBuf = Buffer.from(signature, 'hex');

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}

/**
 * Creates a tamper-evident SHA-256 hash for HIPAA-compliant audit logging.
 * Forms an append-only hash chain where each block verifies the previous entry.
 */
export function computeAuditHash(
  previousHash: string,
  timestamp: string,
  actorUserId: string,
  action: string,
  details: string
): string {
  const payload = `${previousHash}|${timestamp}|${actorUserId}|${action}|${details}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Generates a signed, single-use token for 1-click email medication confirmation.
 * Allows an elderly patient or caretaker to click directly from email without logging in.
 */
export function signOneClickActionToken(doseId: string, action: 'ADMINISTER' | 'SNOOZE', expiresAt: number): string {
  const payload = `${doseId}:${action}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', ONE_CLICK_SECRET).update(payload).digest('hex');
  const tokenPayload = Buffer.from(JSON.stringify({ doseId, action, expiresAt, sig })).toString('base64url');
  return tokenPayload;
}

/**
 * Verifies a 1-click action token.
 */
export function verifyOneClickActionToken(tokenStr: string): { valid: boolean; doseId?: string; action?: 'ADMINISTER' | 'SNOOZE' } {
  try {
    const raw = Buffer.from(tokenStr, 'base64url').toString('utf-8');
    const { doseId, action, expiresAt, sig } = JSON.parse(raw);

    if (Date.now() > expiresAt) {
      return { valid: false };
    }

    const expectedSig = crypto.createHmac('sha256', ONE_CLICK_SECRET).update(`${doseId}:${action}:${expiresAt}`).digest('hex');
    const valid = crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig));

    return valid ? { valid: true, doseId, action } : { valid: false };
  } catch {
    return { valid: false };
  }
}
