import test from 'node:test';
import assert from 'node:assert/strict';
import { DosageSchema, ScheduledTimeSchema, MedicationCreateSchema } from '../lib/utils/validation';

test('Zod Validation: accepts valid clinical medication dosages', () => {
  const validDosages = ['500 mg', '10ml', '2 tablets', '25 mcg', '5 IU', '2 drops', '1 puff'];
  for (const d of validDosages) {
    const result = DosageSchema.safeParse(d);
    assert.equal(result.success, true, `Expected valid dosage for: ${d}`);
  }
});

test('Zod Validation: rejects invalid or ambiguous medication dosages', () => {
  const invalidDosages = ['two pills', 'some', '500', 'a lot', '', '10 kilograms'];
  for (const d of invalidDosages) {
    const result = DosageSchema.safeParse(d);
    assert.equal(result.success, false, `Expected invalid dosage for: ${d}`);
  }
});

test('Zod Validation: validates 24-hour HH:MM schedule time format', () => {
  assert.equal(ScheduledTimeSchema.safeParse('08:00').success, true);
  assert.equal(ScheduledTimeSchema.safeParse('21:30').success, true);
  assert.equal(ScheduledTimeSchema.safeParse('00:00').success, true);

  // Invalid times
  assert.equal(ScheduledTimeSchema.safeParse('8:00').success, false);
  assert.equal(ScheduledTimeSchema.safeParse('24:00').success, false);
  assert.equal(ScheduledTimeSchema.safeParse('morning').success, false);
});

test('Zod Validation: validates complete medication prescription payload', () => {
  const validMed = {
    name: 'Lisinopril',
    dosage: '10 mg',
    form: 'TABLET',
    instructions: 'Take 1 tablet every morning with water.',
    foodRelation: 'NO_RESTRICTION',
    scheduledTimes: ['08:00'],
    isCritical: true,
  };

  const parsed = MedicationCreateSchema.safeParse(validMed);
  assert.equal(parsed.success, true);
});
