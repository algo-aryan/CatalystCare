import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DrugInteractionReport } from '@/types';

function getGeminiClient(): GoogleGenerativeAI | null {
  let key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('GEMINI_API_KEY=')) {
            key = trimmed.substring('GEMINI_API_KEY='.length).trim();
            break;
          }
        }
      }
    } catch {}
  }
  return key ? new GoogleGenerativeAI(key) : null;
}

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
  telmisartan: [
    {
      target: 'potassium',
      severity: 'HIGH',
      effect: 'Concomitant potassium supplements or potassium-sparing diuretics may cause hyperkalemia in elderly patients.',
      rec: 'Monitor serum potassium levels periodically. Avoid potassium supplements unless prescribed.',
    },
    {
      target: 'ibuprofen',
      severity: 'MODERATE',
      effect: 'NSAIDs like Ibuprofen/Combiflam may reduce antihypertensive effect of Telmisartan and impact kidney function.',
      rec: 'Prefer Paracetamol 650 (Dolo) for fever or body pain.',
    },
  ],
  telma: [
    {
      target: 'potassium',
      severity: 'HIGH',
      effect: 'Concomitant potassium supplements may cause dangerous hyperkalemia in seniors.',
      rec: 'Avoid potassium supplements without nephrologist approval.',
    },
  ],
  atorvastatin: [
    {
      target: 'grapefruit',
      severity: 'MODERATE',
      effect: 'Inhibits CYP3A4, significantly increasing atorvastatin levels and risk of myopathy/rhabdomyolysis.',
      rec: 'Avoid grapefruit and grapefruit juice (मौसमी का रस) completely.',
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
  const genAI = getGeminiClient();
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
  const genAI = getGeminiClient();
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
  if (lower.includes('pantoprazole') || lower.includes('pan')) {
    return 'सुबह खाली पेट लेने पर यह आपके पेट में गैस, खट्टी डकार और एसिडिटी को रोकता है। (Prevents stomach acid and keeps your digestion comfortable).';
  }
  if (lower.includes('metformin') || lower.includes('glycomet')) {
    return 'खाना खाने के बाद लेने पर यह आपके शुगर लेवल को सुरक्षित और संतुलित रखता है। (Keeps your blood sugar balanced and healthy after meals).';
  }
  if (lower.includes('telmisartan') || lower.includes('telma') || lower.includes('lisinopril') || lower.includes('amlodipine')) {
    return 'यह आपके रक्तचाप (BP) को नियंत्रित रखता है और दिल को शांत और सुरक्षित बनाए रखता है। (Gently relaxes blood vessels to control blood pressure and protect your heart).';
  }
  if (lower.includes('atorvastatin') || lower.includes('atorva')) {
    return 'रात को लेने पर यह नसों में जमा होने वाले खराब कोलेस्ट्रॉल को कम कर दिल को स्वस्थ रखता है। (Keeps your arteries clean and healthy by managing cholesterol while you sleep).';
  }
  return `Helps support your health routine according to doctor's advice. Take ${dosage} with water as scheduled.`;
}
