import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateCareLinkCode,
  signCareLinkCode,
  verifyCareLinkSignature,
  computeAuditHash,
  signOneClickActionToken,
  verifyOneClickActionToken,
} from '../lib/security/crypto';

test('CareLink Security: generates 6-char phonetically unambiguous token', () => {
  const code = generateCareLinkCode();
  assert.equal(code.length, 6);
  // Must only contain unambiguous charset (excludes 0, O, 1, I, L)
  assert.match(code, /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
});

test('CareLink Security: valid HMAC signature passes verification', () => {
  const code = 'CARE99';
  const patientId = 'patient_eleanor_vance';
  const role = 'CARETAKER';
  const expiresAt = new Date(Date.now() + 86400000).toISOString();

  const signature = signCareLinkCode(code, patientId, role, expiresAt);
  const isValid = verifyCareLinkSignature(code, patientId, role, expiresAt, signature);
  assert.equal(isValid, true);
});

test('CareLink Security: rejects tampered token or altered role', () => {
  const code = 'CARE99';
  const patientId = 'patient_eleanor_vance';
  const role = 'CARETAKER';
  const expiresAt = new Date(Date.now() + 86400000).toISOString();

  const signature = signCareLinkCode(code, patientId, role, expiresAt);
  
  // Attacker tries to elevate role or alter code
  const isCodeTampered = verifyCareLinkSignature('FAKE88', patientId, role, expiresAt, signature);
  const isRoleTampered = verifyCareLinkSignature(code, patientId, 'ADMIN', expiresAt, signature);

  assert.equal(isCodeTampered, false);
  assert.equal(isRoleTampered, false);
});

test('One-Click Action Token: signs and verifies email confirmation token', () => {
  const doseId = 'dose_20261115_met_0800';
  const expiry = Date.now() + 3600000; // 1 hour

  const token = signOneClickActionToken(doseId, 'ADMINISTER', expiry);
  const result = verifyOneClickActionToken(token);

  assert.equal(result.valid, true);
  assert.equal(result.doseId, doseId);
  assert.equal(result.action, 'ADMINISTER');
});

test('One-Click Action Token: rejects expired token', () => {
  const doseId = 'dose_old';
  const expiredTime = Date.now() - 10000; // Already expired

  const token = signOneClickActionToken(doseId, 'ADMINISTER', expiredTime);
  const result = verifyOneClickActionToken(token);

  assert.equal(result.valid, false);
});

test('Audit Log: produces deterministic SHA-256 hash chain block', () => {
  const prevHash = '00000000000000000000';
  const timestamp = '2026-11-15T09:00:00.000Z';
  const actor = 'user_patient_eleanor';
  const action = 'MED_ADMINISTERED';
  const details = 'Took Metformin 500mg';

  const hash1 = computeAuditHash(prevHash, timestamp, actor, action, details);
  const hash2 = computeAuditHash(prevHash, timestamp, actor, action, details);

  assert.equal(hash1.length, 64);
  assert.equal(hash1, hash2);

  // Different details must alter the hash (avalanche effect)
  const alteredHash = computeAuditHash(prevHash, timestamp, actor, action, 'Tampered detail');
  assert.notEqual(hash1, alteredHash);
});

test('Audit Log: validates cryptographic hash-chain integrity check', () => {
  const b0Hash = '00000000000000000000';
  const b1Hash = computeAuditHash(b0Hash, '2026-11-15T08:00:00Z', 'user1', 'LOGIN', 'Success');
  const b2Hash = computeAuditHash(b1Hash, '2026-11-15T08:05:00Z', 'user1', 'MED_DOSE', 'Administered');

  // Verify chain linkage
  assert.equal(computeAuditHash(b1Hash, '2026-11-15T08:05:00Z', 'user1', 'MED_DOSE', 'Administered'), b2Hash);

  // Altered middle block breaks verification of subsequent blocks
  const tamperedB1 = computeAuditHash(b0Hash, '2026-11-15T08:00:00Z', 'user1', 'LOGIN', 'Tampered');
  const recomputedB2 = computeAuditHash(tamperedB1, '2026-11-15T08:05:00Z', 'user1', 'MED_DOSE', 'Administered');
  assert.notEqual(recomputedB2, b2Hash);
});
