/**
 * CatalystCare Domain Types
 * Healthcare-compliant data modeling for elderly medication and appointment management
 */

export type UserRole = 'PATIENT' | 'CARETAKER' | 'FAMILY_MEMBER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  bloodGroup: string;
  primaryConditions: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferredLanguage: string;
  highContrastDefault: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // e.g., "22:00"
    end: string;   // e.g., "07:00"
  };
  createdAt: string;
}

export interface CaregiverPermissions {
  canAdministerMeds: boolean;
  canEditSchedule: boolean;
  canViewAuditLog: boolean;
  canManageAppointments: boolean;
  receiveEmergencyAlerts: boolean;
}

export interface CareRelationship {
  id: string;
  patientId: string;
  caregiverUserId: string;
  caregiverName: string;
  role: 'CARETAKER' | 'FAMILY_MEMBER';
  permissions: CaregiverPermissions;
  linkedViaToken: string;
  linkedAt: string;
  status: 'ACTIVE' | 'REVOKED';
}

export type MedicationForm = 
  | 'TABLET' 
  | 'CAPSULE' 
  | 'LIQUID' 
  | 'INJECTION' 
  | 'INHALER' 
  | 'DROPS' 
  | 'PATCH';

export type FoodRelation = 'BEFORE_MEAL' | 'WITH_MEAL' | 'AFTER_MEAL' | 'NO_RESTRICTION';

export interface MedicationVisualIdentity {
  shape: 'ROUND_TABLET' | 'OVAL_TABLET' | 'CAPSULE' | 'TRIANGLE_TABLET';
  color: string;
  secondaryColor?: string;
  colorLabel: string;
  purposeLabelHindi: string;
  purposeLabelEnglish: string;
  mealTimingHindi: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  genericName?: string;
  dosage: string; // e.g. "500mg", "10ml"
  form: MedicationForm;
  instructions: string;
  foodRelation: FoodRelation;
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"]
  isCritical: boolean; // Triggers rapid 2-tier escalation on consecutive misses
  startDate: string;
  endDate?: string;
  plainLanguageSummary?: string; // AI-generated simple description for seniors
  visualIdentity?: MedicationVisualIdentity;
  interactionWarnings?: DrugInteractionReport[];
  status: 'ACTIVE' | 'DISCONTINUED';
  createdAt: string;
}

export type DoseStatus = 
  | 'SCHEDULED' 
  | 'UPCOMING' 
  | 'DUE' 
  | 'ADMINISTERED' 
  | 'SNOOZED' 
  | 'OVERDUE' 
  | 'MISSED' 
  | 'LATE';

export interface AdherenceEvent {
  id: string;
  doseId: string;
  medicationId: string;
  patientId: string;
  scheduledTime: string; // ISO string
  status: DoseStatus;
  recordedAt: string;
  administeredBy?: {
    userId: string;
    role: UserRole;
    name: string;
  };
  deviationMinutes: number; // Positive = late, negative = early
  notes?: string;
}

export interface DrugInteractionReport {
  drugA: string;
  drugB: string;
  severity: 'CONTRAINDICATED' | 'HIGH' | 'MODERATE' | 'LOW';
  clinicalEffect: string;
  recommendation: string;
  source: 'GEMINI_CLINICAL_AI' | 'RXNORM_RULE';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  specialty: string;
  clinicHospital: string;
  appointmentTime: string; // ISO timestamp
  contactNumber: string;
  reason: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  reminderSent: boolean;
  createdAt: string;
}

export interface CareLinkToken {
  token: string; // 6-char phonetically clean code
  signature: string; // HMAC-SHA256
  patientId: string;
  targetRole: 'CARETAKER' | 'FAMILY_MEMBER';
  permissions: CaregiverPermissions;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  patientId: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  action: 
    | 'MED_ADMINISTERED' 
    | 'MED_SNOOZED' 
    | 'MED_SCHEDULE_MODIFIED' 
    | 'CARELINK_CREATED' 
    | 'CARELINK_REDEEMED' 
    | 'CARELINK_REVOKED' 
    | 'APPOINTMENT_SCHEDULED' 
    | 'EMERGENCY_ESCALATION_TRIGGERED'
    | 'AUDIT_LOG_VIEWED';
  details: string;
  ipAddress?: string;
  hash: string; // Current entry hash
  previousHash: string; // Tamper-evident hash chain
}

export interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  type: 'DOSE_DUE' | 'DOSE_MISSED' | 'EMERGENCY_ESCALATION' | 'APPOINTMENT_REMINDER';
  patientId: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  oneClickToken?: string;
  createdAt: string;
  sentAt?: string;
}
