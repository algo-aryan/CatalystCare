import { 
  User, 
  PatientProfile, 
  Medication, 
  Appointment, 
  CareRelationship, 
  AdherenceEvent, 
  AuditLogEntry 
} from '@/types';

export const PRIMARY_PATIENT_ID = 'patient_savita_sharma';

export const SEED_USERS: User[] = [
  {
    id: 'user_patient_savita',
    email: 'savita.sharma@gmail.com',
    fullName: 'Savita Sharma',
    role: 'PATIENT',
    phoneNumber: '+91 98101 11223',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'user_caregiver_rahul',
    email: 'rahul.sharma@gmail.com',
    fullName: 'Rahul Sharma',
    role: 'CARETAKER',
    phoneNumber: '+91 98101 23456',
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 'user_family_priya',
    email: 'priya.sharma@gmail.com',
    fullName: 'Priya Sharma',
    role: 'FAMILY_MEMBER',
    phoneNumber: '+91 98202 34567',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

export const SEED_PATIENT_PROFILE: PatientProfile = {
  id: PRIMARY_PATIENT_ID,
  userId: 'user_patient_savita',
  fullName: 'Savita Sharma',
  dateOfBirth: '1950-08-15',
  bloodGroup: 'B+',
  primaryConditions: ['Type 2 Diabetes (मधुमेह)', 'Essential Hypertension (उच्च रक्तचाप)', 'Osteoarthritis (घुटनों का दर्द)'],
  allergies: ['Penicillin (Moderate skin rash)'],
  emergencyContact: {
    name: 'Rahul Sharma (Son)',
    relationship: 'Son & Primary Caretaker (बेटा)',
    phone: '+91 98101 23456',
  },
  preferredLanguage: 'Hindi / English (द्विभाषी)',
  highContrastDefault: false,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '06:30',
  },
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
};

export const SEED_MEDICATIONS: Medication[] = [
  {
    id: 'med_pantoprazole',
    patientId: PRIMARY_PATIENT_ID,
    name: 'Pantoprazole 40 mg (Pan 40)',
    genericName: 'Pantoprazole Sodium',
    dosage: '40 mg',
    form: 'TABLET',
    instructions: 'Take 1 tablet in the morning on an empty stomach, 30 minutes before breakfast.',
    foodRelation: 'BEFORE_MEAL',
    scheduledTimes: ['07:30'],
    isCritical: false,
    startDate: '2024-01-01',
    plainLanguageSummary: 'सुबह खाली पेट लें - यह आपके पेट में गैस और एसिडिटी को रोकता है। (Prevents morning stomach acidity).',
    interactionWarnings: [],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'med_metformin',
    patientId: PRIMARY_PATIENT_ID,
    name: 'Metformin 500 mg (Glycomet)',
    genericName: 'Metformin Hydrochloride',
    dosage: '500 mg',
    form: 'TABLET',
    instructions: 'Take 1 tablet twice daily with or immediately after meals (Breakfast & Dinner).',
    foodRelation: 'WITH_MEAL',
    scheduledTimes: ['08:00', '20:00'],
    isCritical: true,
    startDate: '2024-01-01',
    plainLanguageSummary: 'नाश्ते और रात के खाने के बाद लें - यह आपके शुगर लेवल को सुरक्षित और संतुलित रखता है। (Keeps blood sugar balanced).',
    interactionWarnings: [],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'med_telmisartan',
    patientId: PRIMARY_PATIENT_ID,
    name: 'Telmisartan 40 mg (Telma 40)',
    genericName: 'Telmisartan',
    dosage: '40 mg',
    form: 'TABLET',
    instructions: 'Take 1 tablet every morning with a full glass of water for blood pressure.',
    foodRelation: 'NO_RESTRICTION',
    scheduledTimes: ['08:00'],
    isCritical: true,
    startDate: '2024-01-01',
    plainLanguageSummary: 'सुबह एक गोली पानी के साथ लें - यह आपके ब्लड प्रेशर को नियंत्रित और दिल को सुरक्षित रखती है। (Controls blood pressure & protects heart).',
    interactionWarnings: [],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'med_atorvastatin',
    patientId: PRIMARY_PATIENT_ID,
    name: 'Atorvastatin 20 mg (Atorva 20)',
    genericName: 'Atorvastatin Calcium',
    dosage: '20 mg',
    form: 'TABLET',
    instructions: 'Take 1 tablet at bedtime with water to manage cholesterol levels.',
    foodRelation: 'NO_RESTRICTION',
    scheduledTimes: ['21:00'],
    isCritical: false,
    startDate: '2024-02-15',
    plainLanguageSummary: 'सोने से पहले लें - यह रात के समय कोलेस्ट्रॉल को कम कर आपकी नसों को स्वस्थ रखता है। (Lowers harmful cholesterol overnight).',
    interactionWarnings: [
      {
        drugA: 'Atorvastatin',
        drugB: 'Grapefruit Juice / मौसमी का जूस',
        severity: 'MODERATE',
        clinicalEffect: 'May increase blood concentrations of atorvastatin leading to muscle soreness.',
        recommendation: 'Avoid consuming grapefruit juice while on this medication.',
        source: 'GEMINI_CLINICAL_AI',
      },
    ],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export const SEED_CARE_RELATIONSHIPS: CareRelationship[] = [
  {
    id: 'rel_rahul',
    patientId: PRIMARY_PATIENT_ID,
    caregiverUserId: 'user_caregiver_rahul',
    caregiverName: 'Rahul Sharma (बेटा)',
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
    id: 'rel_priya',
    patientId: PRIMARY_PATIENT_ID,
    caregiverUserId: 'user_family_priya',
    caregiverName: 'Priya Sharma (बेटी)',
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
    id: 'appt_cardiology_fortis',
    patientId: PRIMARY_PATIENT_ID,
    doctorName: 'Dr. Arvind Kapoor, MD (Cardiologist)',
    specialty: 'Heart & Hypertension Care',
    clinicHospital: 'Fortis Escorts Heart Institute, Okhla, New Delhi',
    appointmentTime: new Date(Date.now() + 2 * 86400000 + 3 * 3600000).toISOString(), // 2 days ahead at 10:30 AM
    contactNumber: '+91 11 4713 5000',
    reason: 'Quarterly hypertension checkup & ECG review',
    notes: 'Please bring last 2 weeks BP journal and recent lipid panel report.',
    status: 'SCHEDULED',
    reminderSent: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'appt_endocrinology_max',
    patientId: PRIMARY_PATIENT_ID,
    doctorName: 'Dr. Anita Desai, MD (Endocrinologist)',
    specialty: 'Diabetes & Metabolism',
    clinicHospital: 'Max Super Speciality Hospital, Saket, New Delhi',
    appointmentTime: new Date(Date.now() + 12 * 86400000).toISOString(),
    contactNumber: '+91 11 2651 5050',
    reason: 'HbA1c & Fasting blood sugar quarterly review',
    notes: 'Overnight fasting required for 10 hours prior to blood test.',
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

    // Pantoprazole 07:30
    events.push({
      id: `adh_${dateStr}_panto_am`,
      doseId: `dose_${dateStr}_med_pantoprazole_0730`,
      medicationId: 'med_pantoprazole',
      patientId: PRIMARY_PATIENT_ID,
      scheduledTime: `${dateStr}T07:30:00.000Z`,
      status: 'ADMINISTERED',
      recordedAt: `${dateStr}T07:32:00.000Z`,
      administeredBy: {
        userId: 'user_patient_savita',
        role: 'PATIENT',
        name: 'Savita Sharma',
      },
      deviationMinutes: 2,
    });

    // Metformin Morning 08:00
    events.push({
      id: `adh_${dateStr}_metformin_am`,
      doseId: `dose_${dateStr}_med_metformin_0800`,
      medicationId: 'med_metformin',
      patientId: PRIMARY_PATIENT_ID,
      scheduledTime: `${dateStr}T08:00:00.000Z`,
      status: 'ADMINISTERED',
      recordedAt: `${dateStr}T08:05:00.000Z`,
      administeredBy: {
        userId: 'user_patient_savita',
        role: 'PATIENT',
        name: 'Savita Sharma',
      },
      deviationMinutes: 5,
    });

    // Telmisartan Morning 08:00
    events.push({
      id: `adh_${dateStr}_telmisartan_am`,
      doseId: `dose_${dateStr}_med_telmisartan_0800`,
      medicationId: 'med_telmisartan',
      patientId: PRIMARY_PATIENT_ID,
      scheduledTime: `${dateStr}T08:00:00.000Z`,
      status: 'ADMINISTERED',
      recordedAt: `${dateStr}T08:05:00.000Z`,
      administeredBy: {
        userId: 'user_patient_savita',
        role: 'PATIENT',
        name: 'Savita Sharma',
      },
      deviationMinutes: 5,
    });

    // Metformin Evening 20:00
    events.push({
      id: `adh_${dateStr}_metformin_pm`,
      doseId: `dose_${dateStr}_med_metformin_2000`,
      medicationId: 'med_metformin',
      patientId: PRIMARY_PATIENT_ID,
      scheduledTime: `${dateStr}T20:00:00.000Z`,
      status: dayOffset === 2 ? 'MISSED' : 'ADMINISTERED',
      recordedAt: dayOffset === 2 ? `${dateStr}T22:30:00.000Z` : `${dateStr}T20:15:00.000Z`,
      deviationMinutes: dayOffset === 2 ? 150 : 15,
      notes: dayOffset === 2 ? 'Attended family satsang and returned late' : undefined,
    });

    // Atorvastatin Night 21:00
    events.push({
      id: `adh_${dateStr}_atorva_pm`,
      doseId: `dose_${dateStr}_med_atorvastatin_2100`,
      medicationId: 'med_atorvastatin',
      patientId: PRIMARY_PATIENT_ID,
      scheduledTime: `${dateStr}T21:00:00.000Z`,
      status: 'ADMINISTERED',
      recordedAt: `${dateStr}T21:05:00.000Z`,
      deviationMinutes: 5,
    });
  }

  return events;
}

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'audit_init_01',
    timestamp: new Date(Date.now() - 28 * 86400000).toISOString(),
    patientId: PRIMARY_PATIENT_ID,
    actorUserId: 'user_patient_savita',
    actorName: 'Savita Sharma',
    actorRole: 'PATIENT',
    action: 'CARELINK_CREATED',
    details: 'Generated 6-char CareLink passcode for Rahul Sharma (Son & Primary Caretaker)',
    hash: '8f4c28b5e2b001a1829e',
    previousHash: '00000000000000000000',
  },
  {
    id: 'audit_init_02',
    timestamp: new Date(Date.now() - 28 * 86400000 + 3600000).toISOString(),
    patientId: PRIMARY_PATIENT_ID,
    actorUserId: 'user_caregiver_rahul',
    actorName: 'Rahul Sharma',
    actorRole: 'CARETAKER',
    action: 'CARELINK_REDEEMED',
    details: 'Redeemed CareLink token. Full administration permissions granted to Rahul Sharma.',
    hash: '3d8a11bc029ff100a921',
    previousHash: '8f4c28b5e2b001a1829e',
  },
];
