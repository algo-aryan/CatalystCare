import { 
  User, 
  PatientProfile, 
  Medication, 
  Appointment, 
  CareRelationship, 
  AdherenceEvent, 
  AuditLogEntry 
} from '@/types';

export const SEED_USERS: User[] = [
  {
    id: 'user_patient_eleanor',
    email: 'eleanor.vance@gmail.com',
    fullName: 'Eleanor Vance',
    role: 'PATIENT',
    phoneNumber: '+1-555-019-2831',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'user_caregiver_marcus',
    email: 'marcus.vance@gmail.com',
    fullName: 'Marcus Vance',
    role: 'CARETAKER',
    phoneNumber: '+1-555-019-8822',
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 'user_family_sarah',
    email: 'sarah.vance@outlook.com',
    fullName: 'Sarah Vance',
    role: 'FAMILY_MEMBER',
    phoneNumber: '+1-555-019-4411',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

export const SEED_PATIENT_PROFILE: PatientProfile = {
  id: 'patient_eleanor_vance',
  userId: 'user_patient_eleanor',
  fullName: 'Eleanor Vance',
  dateOfBirth: '1948-03-14',
  bloodGroup: 'O+',
  primaryConditions: ['Essential Hypertension', 'Type 2 Diabetes', 'Osteoarthritis'],
  allergies: ['Penicillin (Moderate rash)'],
  emergencyContact: {
    name: 'Marcus Vance (Son)',
    relationship: 'Son & Primary Caregiver',
    phone: '+1-555-019-8822',
  },
  preferredLanguage: 'English',
  highContrastDefault: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
};

export const SEED_MEDICATIONS: Medication[] = [
  {
    id: 'med_metformin',
    patientId: 'patient_eleanor_vance',
    name: 'Metformin Hydrochloride',
    genericName: 'Metformin',
    dosage: '500 mg',
    form: 'TABLET',
    instructions: 'Take 1 tablet with breakfast and dinner to lower blood sugar.',
    foodRelation: 'WITH_MEAL',
    scheduledTimes: ['08:00', '20:00'],
    isCritical: true,
    startDate: '2024-01-01',
    plainLanguageSummary: 'Helps keep your blood sugar in a safe, healthy balance after meals.',
    interactionWarnings: [],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'med_lisinopril',
    patientId: 'patient_eleanor_vance',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    dosage: '10 mg',
    form: 'TABLET',
    instructions: 'Take 1 tablet every morning with a full glass of water for blood pressure.',
    foodRelation: 'NO_RESTRICTION',
    scheduledTimes: ['08:00'],
    isCritical: true,
    startDate: '2024-01-01',
    plainLanguageSummary: 'Relaxes your blood vessels to protect your heart and control blood pressure.',
    interactionWarnings: [],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'med_atorvastatin',
    patientId: 'patient_eleanor_vance',
    name: 'Atorvastatin Calcium',
    genericName: 'Atorvastatin',
    dosage: '20 mg',
    form: 'TABLET',
    instructions: 'Take 1 tablet at bedtime to manage cholesterol levels.',
    foodRelation: 'NO_RESTRICTION',
    scheduledTimes: ['21:00'],
    isCritical: false,
    startDate: '2024-02-15',
    plainLanguageSummary: 'Protects your arteries by lowering harmful cholesterol while you sleep.',
    interactionWarnings: [
      {
        drugA: 'Atorvastatin',
        drugB: 'Grapefruit Juice',
        severity: 'MODERATE',
        clinicalEffect: 'May increase blood concentrations of atorvastatin leading to muscle pain.',
        recommendation: 'Avoid consuming grapefruit or grapefruit juice while on this medication.',
        source: 'GEMINI_CLINICAL_AI',
      },
    ],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export const SEED_CARE_RELATIONSHIPS: CareRelationship[] = [
  {
    id: 'rel_marcus',
    patientId: 'patient_eleanor_vance',
    caregiverUserId: 'user_caregiver_marcus',
    caregiverName: 'Marcus Vance',
    role: 'CARETAKER',
    permissions: {
      canAdministerMeds: true,
      canEditSchedule: true,
      canViewAuditLog: true,
      canManageAppointments: true,
      receiveEmergencyAlerts: true,
    },
    linkedViaToken: 'CARE99',
    linkedAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'rel_sarah',
    patientId: 'patient_eleanor_vance',
    caregiverUserId: 'user_family_sarah',
    caregiverName: 'Sarah Vance',
    role: 'FAMILY_MEMBER',
    permissions: {
      canAdministerMeds: false,
      canEditSchedule: false,
      canViewAuditLog: true,
      canManageAppointments: false,
      receiveEmergencyAlerts: true,
    },
    linkedViaToken: 'FAML77',
    linkedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    status: 'ACTIVE',
  },
];

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt_cardiology_followup',
    patientId: 'patient_eleanor_vance',
    doctorName: 'Dr. Robert Chen, MD',
    specialty: 'Cardiovascular Care',
    clinicHospital: 'St. Jude Heart & Vascular Institute, Suite 402',
    appointmentTime: new Date(Date.now() + 2 * 86400000 + 4 * 3600000).toISOString(), // 2 days ahead at 10:00 AM
    contactNumber: '+1-555-901-2244',
    reason: 'Quarterly hypertension review & ECG evaluation',
    notes: 'Bring current medication log and blood pressure journal.',
    status: 'SCHEDULED',
    reminderSent: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'appt_endocrinology',
    patientId: 'patient_eleanor_vance',
    doctorName: 'Dr. Anita Desai, MD',
    specialty: 'Endocrinology & Diabetes',
    clinicHospital: 'Metro Health Pavilion',
    appointmentTime: new Date(Date.now() + 14 * 86400000).toISOString(),
    contactNumber: '+1-555-772-8810',
    reason: 'Routine HbA1c screening',
    notes: 'Fast for 8 hours prior to appointment.',
    status: 'SCHEDULED',
    reminderSent: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// Generate past 7 days of realistic adherence events
export function generateInitialAdherenceEvents(): AdherenceEvent[] {
  const events: AdherenceEvent[] = [];
  const now = Date.now();

  for (let dayOffset = 6; dayOffset >= 1; dayOffset--) {
    const dayDate = new Date(now - dayOffset * 86400000);
    const dateStr = dayDate.toISOString().split('T')[0];

    // Metformin Morning
    events.push({
      id: `adh_${dateStr}_metformin_am`,
      doseId: `dose_${dateStr}_met_0800`,
      medicationId: 'med_metformin',
      patientId: 'patient_eleanor_vance',
      scheduledTime: `${dateStr}T08:00:00.000Z`,
      status: 'ADMINISTERED',
      recordedAt: `${dateStr}T08:05:00.000Z`,
      administeredBy: {
        userId: 'user_patient_eleanor',
        role: 'PATIENT',
        name: 'Eleanor Vance',
      },
      deviationMinutes: 5,
    });

    // Lisinopril Morning
    events.push({
      id: `adh_${dateStr}_lisinopril_am`,
      doseId: `dose_${dateStr}_lis_0800`,
      medicationId: 'med_lisinopril',
      patientId: 'patient_eleanor_vance',
      scheduledTime: `${dateStr}T08:00:00.000Z`,
      status: 'ADMINISTERED',
      recordedAt: `${dateStr}T08:05:00.000Z`,
      administeredBy: {
        userId: 'user_patient_eleanor',
        role: 'PATIENT',
        name: 'Eleanor Vance',
      },
      deviationMinutes: 5,
    });

    // Metformin Evening
    events.push({
      id: `adh_${dateStr}_metformin_pm`,
      doseId: `dose_${dateStr}_met_2000`,
      medicationId: 'med_metformin',
      patientId: 'patient_eleanor_vance',
      scheduledTime: `${dateStr}T20:00:00.000Z`,
      status: dayOffset === 2 ? 'MISSED' : 'ADMINISTERED', // Realistic 1 missed dose 2 days ago
      recordedAt: dayOffset === 2 ? `${dateStr}T22:00:00.000Z` : `${dateStr}T20:15:00.000Z`,
      deviationMinutes: dayOffset === 2 ? 120 : 15,
      notes: dayOffset === 2 ? 'Fell asleep early after dinner' : undefined,
    });

    // Atorvastatin Night
    events.push({
      id: `adh_${dateStr}_atorvastatin_pm`,
      doseId: `dose_${dateStr}_ator_2100`,
      medicationId: 'med_atorvastatin',
      patientId: 'patient_eleanor_vance',
      scheduledTime: `${dateStr}T21:00:00.000Z`,
      status: 'ADMINISTERED',
      recordedAt: `${dateStr}T21:02:00.000Z`,
      deviationMinutes: 2,
    });
  }

  return events;
}

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'audit_init_01',
    timestamp: new Date(Date.now() - 28 * 86400000).toISOString(),
    patientId: 'patient_eleanor_vance',
    actorUserId: 'user_patient_eleanor',
    actorName: 'Eleanor Vance',
    actorRole: 'PATIENT',
    action: 'CARELINK_CREATED',
    details: 'Generated 6-char CareLink token for Marcus Vance (Caretaker)',
    hash: '8f4c28b5e2b001a1829e',
    previousHash: '00000000000000000000',
  },
  {
    id: 'audit_init_02',
    timestamp: new Date(Date.now() - 28 * 86400000 + 3600000).toISOString(),
    patientId: 'patient_eleanor_vance',
    actorUserId: 'user_caregiver_marcus',
    actorName: 'Marcus Vance',
    actorRole: 'CARETAKER',
    action: 'CARELINK_REDEEMED',
    details: 'Redeemed CareLink token. Full administration permissions granted.',
    hash: '3d8a11bc029ff100a921',
    previousHash: '8f4c28b5e2b001a1829e',
  },
];
