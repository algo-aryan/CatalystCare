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

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const validationResult = MedicationCreateSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
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
