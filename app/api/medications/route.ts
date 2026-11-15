import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyzeDrugInteractions, generatePlainLanguageSummary } from '@/lib/ai/gemini-clinical';
import { MedicationCreateSchema } from '@/lib/utils/validation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';
  const medications = db.getMedications(activeOnly);
  return NextResponse.json({ medications });
}

function normalizeTime(t: string): string {
  const s = t.trim();
  if (/^\d:[0-5]\d$/.test(s)) return `0${s}`;
  const ampmMatch = s.match(/^(\d{1,2})(?::([0-5]\d))?\s*(am|pm)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] || '00';
    const isPm = ampmMatch[3].toLowerCase() === 'pm';
    if (isPm && hours < 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  return s;
}

function normalizeDosage(d: string): string {
  const s = (d || '').trim();
  if (/^\d+$/.test(s)) return `${s} mg`;
  return s;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    if (rawBody.dosage) {
      rawBody.dosage = normalizeDosage(rawBody.dosage);
    }
    if (Array.isArray(rawBody.scheduledTimes)) {
      rawBody.scheduledTimes = rawBody.scheduledTimes.map((t: string) => normalizeTime(t));
    }

    const validationResult = MedicationCreateSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || 'Validation failed';
      return NextResponse.json(
        {
          error: firstError,
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, genericName, dosage, form, instructions, foodRelation, scheduledTimes, isCritical, patientId } = validationResult.data;

    const patientProfile = db.getPatientProfile();
    const existingMeds = db.getMedications(true).map((m) => m.name);

    // Call AI in parallel for drug-drug interaction check and plain-language explainer
    const [interactions, plainSummary] = await Promise.all([
      analyzeDrugInteractions(name, existingMeds, patientProfile.primaryConditions),
      generatePlainLanguageSummary(name, dosage, instructions),
    ]);

    const newMed = db.addMedication({
      patientId: patientId || patientProfile.id,
      name,
      genericName: genericName || name,
      dosage,
      form: form || 'TABLET',
      instructions,
      foodRelation: foodRelation || 'NO_RESTRICTION',
      scheduledTimes,
      isCritical: Boolean(isCritical),
      startDate: new Date().toISOString().split('T')[0],
      plainLanguageSummary: plainSummary,
      interactionWarnings: interactions,
      status: 'ACTIVE',
    });

    return NextResponse.json({
      success: true,
      medication: newMed,
      interactionsDetected: interactions.length > 0,
      interactions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });
    }

    if (updates.scheduledTimes && Array.isArray(updates.scheduledTimes)) {
      updates.scheduledTimes = updates.scheduledTimes.map((t: string) => normalizeTime(t));
    }
    if (updates.dosage) {
      updates.dosage = normalizeDosage(updates.dosage);
    }

    const updated = db.updateMedication(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, medication: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });
  }

  const success = db.deleteMedication(id);
  if (!success) {
    return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
