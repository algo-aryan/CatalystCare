import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCareLinkCode, signCareLinkCode, verifyCareLinkSignature, signOneClickActionToken, verifyOneClickActionToken } from '../lib/security/crypto';
import { MedicationCreateSchema } from '../lib/utils/validation';

test('API Route Integration: CareLink token generation, HMAC signing and verification lifecycle', () => {
  const patientId = 'patient_savita_sharma';
  const role = 'CARETAKER';
  const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
  const code = generateCareLinkCode();
  const signature = signCareLinkCode(code, patientId, role, expiresAt);

  assert.equal(code.length, 6, 'Token code must be 6 characters');

  const isValid = verifyCareLinkSignature(
    code,
    patientId,
    role,
    expiresAt,
    signature
  );
  assert.equal(isValid, true, 'HMAC signature must verify cleanly');

  // Tampered role rejection
  const tamperedRole = verifyCareLinkSignature(
    code,
    patientId,
    'CLINICIAN',
    expiresAt,
    signature
  );
  assert.equal(tamperedRole, false, 'Tampered role must fail verification');
});

test('API Route Integration: 1-Click action email confirmation token lifecycle', () => {
  const expiresAt = Date.now() + 24 * 3600 * 1000;
  const token = signOneClickActionToken('dose_test_123', 'ADMINISTER', expiresAt);
  assert.ok(token.length > 20, 'Action token must be signed string');

  const verified = verifyOneClickActionToken(token);
  assert.equal(verified.valid, true);
  assert.equal(verified.doseId, 'dose_test_123');
  assert.equal(verified.action, 'ADMINISTER');

  // Tampered token rejection
  const tampered = verifyOneClickActionToken(token + 'malicious');
  assert.equal(tampered.valid, false);
});

test('API Route Integration: Medication prescription payload validation', () => {
  const validPayload = {
    name: 'Amlodipine 5 mg',
    dosage: '5 mg',
    instructions: 'Take 1 tablet every morning',
    scheduledTimes: ['08:00'],
    isCritical: false,
    patientId: 'patient_savita_sharma',
  };

  const parsed = MedicationCreateSchema.safeParse(validPayload);
  assert.equal(parsed.success, true);
});
