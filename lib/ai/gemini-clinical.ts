import { GoogleGenerativeAI } from '@google/generative-ai';
import { DrugInteractionReport } from '@/types';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Embedded Clinical Safety Rules (Fallback when API key is not provided)
const CLINICAL_RULES_FALLBACK: Record<string, { target: string; severity: 'CONTRAINDICATED' | 'HIGH' | 'MODERATE' | 'LOW'; effect: string; rec: string }[]> = {
  lisinopril: [
    {
      target: 'potassium',
      severity: 'HIGH',
      effect: 'Concomitant use may result in severe hyperkalemia in elderly patients.',
      rec: 'Monitor serum potassium and renal function closely.',
    },
    {
      target: 'ibuprofen',
      severity: 'MODERATE',
      effect: 'NSAIDs may diminish the antihypertensive effect of ACE inhibitors and worsen renal impairment.',
      rec: 'Use paracetamol/acetaminophen for pain relief instead of NSAIDs.',
    },
  ],
  atorvastatin: [
    {
      target: 'grapefruit',
      severity: 'MODERATE',
      effect: 'Inhibits CYP3A4, significantly increasing atorvastatin levels and risk of myopathy/rhabdomyolysis.',
      rec: 'Avoid grapefruit and grapefruit juice completely.',
    },
    {
      target: 'clarithromycin',
      severity: 'HIGH',
      effect: 'Strong CYP3A4 inhibitor increases statin blood concentrations drastically.',
      rec: 'Suspend atorvastatin during macrolide antibiotic course.',
    },
  ],
  metformin: [
    {
      target: 'alcohol',
      severity: 'HIGH',
      effect: 'Increases risk of life-threatening lactic acidosis and severe hypoglycemia.',
      rec: 'Avoid heavy or acute alcohol consumption while taking metformin.',
    },
  ],
  warfarin: [
    {
      target: 'aspirin',
      severity: 'CONTRAINDICATED',
      effect: 'Dual antiplatelet/anticoagulant effect exponentially elevates major gastrointestinal bleeding risk.',
      rec: 'Contraindicated unless explicitly managed under specialized cardiology protocol.',
    },
  ],
};

/**
 * Checks for drug-drug interactions and elderly-specific risks
 */
export async function analyzeDrugInteractions(
  newDrug: string,
  currentMedications: string[],
  conditions: string[] = []
): Promise<DrugInteractionReport[]> {
  const reports: DrugInteractionReport[] = [];
  const normalizedNew = newDrug.toLowerCase().trim();

  // Try Gemini AI first if configured
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
You are an expert geriatric clinical pharmacist reviewing a prescription for an elderly patient.
Patient Diagnoses: ${conditions.join(', ') || 'Hypertension, Type 2 Diabetes'}
Current Medications: ${currentMedications.join(', ') || 'None'}
New Medication to prescribe: ${newDrug}

Analyze if there are any clinically significant drug-drug, drug-disease, or elderly-specific interaction risks.
Return ONLY a valid JSON array matching this TypeScript structure without markdown fences:
[
  {
    "drugA": "${newDrug}",
    "drugB": "interacting drug or food",
    "severity": "CONTRAINDICATED" | "HIGH" | "MODERATE" | "LOW",
    "clinicalEffect": "brief explanation of biological mechanism and danger",
    "recommendation": "actionable clinical alternative or precaution"
  }
]
If there are no clinically meaningful interactions, return an empty JSON array: [].
`;

      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          ...item,
          source: 'GEMINI_CLINICAL_AI' as const,
        }));
      }
    } catch (err) {
      console.warn('[AI] Gemini interaction analysis failed, falling back to clinical rules:', err);
    }
  }

  // Fallback to internal clinical pharmacology rules
  for (const [key, rules] of Object.entries(CLINICAL_RULES_FALLBACK)) {
    if (normalizedNew.includes(key)) {
      for (const rule of rules) {
        for (const existing of currentMedications) {
          if (existing.toLowerCase().includes(rule.target)) {
            reports.push({
              drugA: newDrug,
              drugB: existing,
              severity: rule.severity,
              clinicalEffect: rule.effect,
              recommendation: rule.rec,
              source: 'RXNORM_RULE',
            });
          }
        }
      }
    }
  }

  return reports;
}

/**
 * Generates an empathetic, jargon-free plain language explanation for seniors
 */
export async function generatePlainLanguageSummary(
  drugName: string,
  dosage: string,
  instructions: string
): Promise<string> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
Explain this medication to an 80-year-old grandmother in 1 or 2 warm, very simple, reassuring sentences.
Medication: ${drugName} ${dosage}
Instructions: ${instructions}
Rule: Do not use complex medical words. Explain WHAT it does for their comfort and health.
`;
      const res = await model.generateContent(prompt);
      return res.response.text().trim();
    } catch (err) {
      console.warn('[AI] Gemini plain explanation fallback:', err);
    }
  }

  // Graceful rule-based generation
  const lower = drugName.toLowerCase();
  if (lower.includes('metformin')) {
    return 'Helps keep your blood sugar balanced and healthy after you eat.';
  }
  if (lower.includes('lisinopril') || lower.includes('amlodipine')) {
    return 'Gently relaxes your blood vessels to keep your blood pressure smooth and protect your heart.';
  }
  if (lower.includes('atorvastatin')) {
    return 'Keeps your blood vessels clean and healthy by managing cholesterol while you sleep.';
  }
  return `Helps support your health routine according to doctor's advice. Take ${dosage} with water as scheduled.`;
}
