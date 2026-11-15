import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDoseStatus } from '../lib/clinical/adherence-engine';

test('Adherence State Machine: returns recorded status if adherence event exists', () => {
  const dummyEvent = {
    id: 'e1',
    doseId: 'd1',
    medicationId: 'm1',
    patientId: 'p1',
    scheduledTime: new Date().toISOString(),
    status: 'ADMINISTERED',
    recordedAt: new Date().toISOString(),
    deviationMinutes: 4,
  };

  const status = computeDoseStatus(new Date().toISOString(), dummyEvent);
  assert.equal(status, 'ADMINISTERED');
});

test('Adherence State Machine: computes UPCOMING for future doses > 30 minutes away', () => {
  const futureIso = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour ahead
  const status = computeDoseStatus(futureIso);
  assert.equal(status, 'UPCOMING');
});

test('Adherence State Machine: computes DUE within 30-minute current window', () => {
  const dueIso = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes ahead
  const status = computeDoseStatus(dueIso);
  assert.equal(status, 'DUE');
});

test('Adherence State Machine: computes OVERDUE between 30 and 120 minutes past scheduled time', () => {
  const overdueIso = new Date(Date.now() - 45 * 60 * 1000).toISOString(); // 45 minutes past
  const status = computeDoseStatus(overdueIso);
  assert.equal(status, 'OVERDUE');
});

test('Adherence State Machine: computes MISSED beyond 120 minutes past scheduled time', () => {
  const missedIso = new Date(Date.now() - 150 * 60 * 1000).toISOString(); // 2.5 hours past
  const status = computeDoseStatus(missedIso);
  assert.equal(status, 'MISSED');
});
