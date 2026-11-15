import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDrugInteractions, generatePlainLanguageSummary } from '../lib/ai/gemini-clinical';

test('Clinical AI Safety: detects dangerous drug interaction (Lisinopril + Potassium)', async () => {
  const interactions = await analyzeDrugInteractions('Lisinopril', ['Potassium Chloride 20mEq']);
  assert.ok(interactions.length > 0);
  assert.equal(interactions[0].severity, 'HIGH');
  assert.match(interactions[0].clinicalEffect.toLowerCase(), /hyperkalemia/);
});

test('Clinical AI Safety: detects food-drug interaction (Atorvastatin + Grapefruit)', async () => {
  const interactions = await analyzeDrugInteractions('Atorvastatin Calcium', ['Grapefruit juice daily']);
  assert.ok(interactions.length > 0);
  assert.equal(interactions[0].severity, 'MODERATE');
  assert.match(interactions[0].recommendation.toLowerCase(), /avoid grapefruit/);
});

test('Clinical AI Safety: returns empty array when no known interaction exists', async () => {
  const interactions = await analyzeDrugInteractions('Vitamin C', ['Paracetamol 500mg']);
  assert.equal(interactions.length, 0);
});

test('Clinical AI Explainer: generates empathetic, senior-friendly explanation without medical jargon', async () => {
  const summary = await generatePlainLanguageSummary('Metformin', '500mg', 'Take with breakfast');
  assert.ok(summary.length > 10);
  assert.match(summary.toLowerCase(), /blood sugar/);
});
