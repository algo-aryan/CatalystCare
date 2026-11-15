import fs from 'fs';
import path from 'path';
import {
  User,
  PatientProfile,
  Medication,
  CareRelationship,
  AdherenceEvent,
  Appointment,
  CareLinkToken,
  AuditLogEntry,
  OutboxEmail,
} from '@/types';
import {
  SEED_USERS,
  SEED_PATIENT_PROFILE,
  SEED_MEDICATIONS,
  SEED_CARE_RELATIONSHIPS,
  SEED_APPOINTMENTS,
  generateInitialAdherenceEvents,
  INITIAL_AUDIT_LOG,
  PRIMARY_PATIENT_ID,
} from './seed-data';
import { computeAuditHash } from '../security/crypto';

interface DatabaseSchema {
  users: User[];
  patientProfile: PatientProfile;
  medications: Medication[];
  careRelationships: CareRelationship[];
  adherenceEvents: AdherenceEvent[];
  appointments: Appointment[];
  careLinkTokens: CareLinkToken[];
  auditLogs: AuditLogEntry[];
  outboxEmails: OutboxEmail[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'catalystcare-db.json');

class CatalystDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.initializeDatabase();
  }

  private initializeDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        // If file contains old English seed data, refresh to Indian profile
        if (!content.includes('patient_eleanor_vance')) {
          return JSON.parse(content);
        }
      }
    } catch (e) {
      console.warn('[DB] Could not read existing DB file, re-initializing with seeds:', e);
    }

    const defaultData: DatabaseSchema = {
      users: SEED_USERS,
      patientProfile: SEED_PATIENT_PROFILE,
      medications: SEED_MEDICATIONS,
      careRelationships: SEED_CARE_RELATIONSHIPS,
      adherenceEvents: generateInitialAdherenceEvents(),
      appointments: SEED_APPOINTMENTS,
      careLinkTokens: [],
      auditLogs: INITIAL_AUDIT_LOG,
      outboxEmails: [],
    };

    this.persist(defaultData);
    return defaultData;
  }

  private persist(state: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Persist error:', e);
    }
  }

  // --- Users ---
  getUsers(): User[] {
    return [...this.data.users];
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  // --- Patient Profile ---
  getPatientProfile(): PatientProfile {
    return { ...this.data.patientProfile };
  }

  updatePatientProfile(updates: Partial<PatientProfile>): PatientProfile {
    this.data.patientProfile = { ...this.data.patientProfile, ...updates };
    this.persist();
    return this.data.patientProfile;
  }

  // --- Medications ---
  getMedications(activeOnly: boolean = false): Medication[] {
    if (activeOnly) {
      return this.data.medications.filter((m) => m.status === 'ACTIVE');
    }
    return [...this.data.medications];
  }

  getMedicationById(id: string): Medication | undefined {
    return this.data.medications.find((m) => m.id === id);
  }

  addMedication(med: Omit<Medication, 'id' | 'createdAt'>): Medication {
    const newMed: Medication = {
      ...med,
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.medications.push(newMed);
    this.persist();

    this.logAudit({
      patientId: newMed.patientId,
      actorUserId: 'system',
      actorName: 'Clinical System',
      actorRole: 'CARETAKER',
      action: 'MED_SCHEDULE_MODIFIED',
      details: `Added new medication: ${newMed.name} (${newMed.dosage}, ${newMed.scheduledTimes.join(', ')})`,
    });

    return newMed;
  }

  updateMedication(id: string, updates: Partial<Medication>): Medication | null {
    const index = this.data.medications.findIndex((m) => m.id === id);
    if (index === -1) return null;

    this.data.medications[index] = { ...this.data.medications[index], ...updates };
    this.persist();

    this.logAudit({
      patientId: this.data.medications[index].patientId,
      actorUserId: 'system',
      actorName: 'Clinical System',
      actorRole: 'CARETAKER',
      action: 'MED_SCHEDULE_MODIFIED',
      details: `Updated medication ${this.data.medications[index].name}`,
    });

    return this.data.medications[index];
  }

  deleteMedication(id: string): boolean {
    const med = this.getMedicationById(id);
    if (!med) return false;

    med.status = 'DISCONTINUED';
    this.persist();

    this.logAudit({
      patientId: med.patientId,
      actorUserId: 'system',
      actorName: 'Clinical System',
      actorRole: 'CARETAKER',
      action: 'MED_SCHEDULE_MODIFIED',
      details: `Discontinued medication: ${med.name}`,
    });

    return true;
  }

  // --- Care Relationships ---
  getCareRelationships(patientId?: string): CareRelationship[] {
    if (patientId) {
      const normalizedId = patientId === 'patient_eleanor_vance' ? PRIMARY_PATIENT_ID : patientId;
      return this.data.careRelationships.filter((r) => r.patientId === normalizedId || r.patientId === patientId);
    }
    return [...this.data.careRelationships];
  }

  addCareRelationship(rel: Omit<CareRelationship, 'id' | 'linkedAt'>): CareRelationship {
    const newRel: CareRelationship = {
      ...rel,
      id: `rel_${Date.now()}`,
      linkedAt: new Date().toISOString(),
    };
    this.data.careRelationships.push(newRel);
    this.persist();

    this.logAudit({
      patientId: newRel.patientId,
      actorUserId: newRel.caregiverUserId,
      actorName: newRel.caregiverName,
      actorRole: newRel.role,
      action: 'CARELINK_REDEEMED',
      details: `Linked new caregiver: ${newRel.caregiverName} (${newRel.role})`,
    });

    return newRel;
  }

  revokeCareRelationship(id: string): boolean {
    const rel = this.data.careRelationships.find((r) => r.id === id);
    if (!rel) return false;
    rel.status = 'REVOKED';
    this.persist();

    this.logAudit({
      patientId: rel.patientId,
      actorUserId: 'user_patient_savita',
      actorName: 'Savita Sharma',
      actorRole: 'PATIENT',
      action: 'CARELINK_REVOKED',
      details: `Revoked caregiver access for ${rel.caregiverName}`,
    });

    return true;
  }

  // --- Adherence Event Sourcing (Append-Only) ---
  getAdherenceEvents(patientId?: string): AdherenceEvent[] {
    if (patientId) {
      const normalizedId = patientId === 'patient_eleanor_vance' ? PRIMARY_PATIENT_ID : patientId;
      return this.data.adherenceEvents.filter((e) => e.patientId === normalizedId || e.patientId === patientId);
    }
    return [...this.data.adherenceEvents];
  }

  recordAdherenceEvent(event: Omit<AdherenceEvent, 'id' | 'recordedAt'>): AdherenceEvent {
    const newEvent: AdherenceEvent = {
      ...event,
      id: `adh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recordedAt: new Date().toISOString(),
    };

    this.data.adherenceEvents.push(newEvent);
    this.persist();

    const med = this.getMedicationById(newEvent.medicationId);
    const medName = med ? med.name : newEvent.medicationId;

    this.logAudit({
      patientId: newEvent.patientId,
      actorUserId: newEvent.administeredBy?.userId || 'system',
      actorName: newEvent.administeredBy?.name || 'Self/System',
      actorRole: newEvent.administeredBy?.role || 'PATIENT',
      action: newEvent.status === 'ADMINISTERED' ? 'MED_ADMINISTERED' : 'MED_SNOOZED',
      details: `Recorded status [${newEvent.status}] for ${medName} at ${newEvent.scheduledTime}. Deviation: ${newEvent.deviationMinutes} min`,
    });

    return newEvent;
  }

  // --- Appointments ---
  getAppointments(patientId?: string): Appointment[] {
    if (patientId) {
      const normalizedId = patientId === 'patient_eleanor_vance' ? PRIMARY_PATIENT_ID : patientId;
      return this.data.appointments.filter((a) => a.patientId === normalizedId || a.patientId === patientId);
    }
    return [...this.data.appointments];
  }

  addAppointment(appt: Omit<Appointment, 'id' | 'createdAt' | 'reminderSent'>): Appointment {
    const newAppt: Appointment = {
      ...appt,
      id: `appt_${Date.now()}`,
      reminderSent: false,
      createdAt: new Date().toISOString(),
    };
    this.data.appointments.push(newAppt);
    this.persist();

    this.logAudit({
      patientId: newAppt.patientId,
      actorUserId: 'system',
      actorName: 'Clinical Coordinator',
      actorRole: 'CARETAKER',
      action: 'APPOINTMENT_SCHEDULED',
      details: `Scheduled appointment with ${newAppt.doctorName} on ${newAppt.appointmentTime}`,
    });

    return newAppt;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const index = this.data.appointments.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.data.appointments[index] = { ...this.data.appointments[index], ...updates };
    this.persist();
    return this.data.appointments[index];
  }

  // --- CareLink Tokens ---
  createCareLinkToken(token: CareLinkToken): void {
    this.data.careLinkTokens.push(token);
    this.persist();

    this.logAudit({
      patientId: token.patientId,
      actorUserId: token.patientId,
      actorName: 'Savita Sharma',
      actorRole: 'PATIENT',
      action: 'CARELINK_CREATED',
      details: `Issued 24h CareLink token [${token.token}] for target role ${token.targetRole}`,
    });
  }

  getCareLinkToken(code: string): CareLinkToken | undefined {
    return this.data.careLinkTokens.find((t) => t.token.toUpperCase() === code.toUpperCase() && !t.used);
  }

  markCareLinkTokenUsed(code: string): void {
    const t = this.data.careLinkTokens.find((item) => item.token.toUpperCase() === code.toUpperCase());
    if (t) {
      t.used = true;
      this.persist();
    }
  }

  // --- Tamper-Evident Hash-Chained Audit Logging ---
  getAuditLogs(patientId?: string): AuditLogEntry[] {
    const normalizedId = patientId === 'patient_eleanor_vance' ? PRIMARY_PATIENT_ID : patientId;
    const logs = normalizedId ? this.data.auditLogs.filter((l) => l.patientId === normalizedId || l.patientId === patientId) : this.data.auditLogs;
    return [...logs].reverse(); // Most recent first
  }

  logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'hash' | 'previousHash'>): AuditLogEntry {
    const lastEntry = this.data.auditLogs[this.data.auditLogs.length - 1];
    const previousHash = lastEntry ? lastEntry.hash : '00000000000000000000';
    const timestamp = new Date().toISOString();
    const hash = computeAuditHash(previousHash, timestamp, entry.actorUserId, entry.action, entry.details);

    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      hash,
      previousHash,
    };

    this.data.auditLogs.push(fullEntry);
    this.persist();
    return fullEntry;
  }

  // --- Proactive Outbox Email Queue ---
  enqueueEmail(email: Omit<OutboxEmail, 'id' | 'createdAt' | 'status'>): OutboxEmail {
    const newEmail: OutboxEmail = {
      ...email,
      id: `mail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };
    this.data.outboxEmails.push(newEmail);
    this.persist();
    return newEmail;
  }

  getOutboxEmails(patientId?: string): OutboxEmail[] {
    const normalizedId = patientId === 'patient_eleanor_vance' ? PRIMARY_PATIENT_ID : patientId;
    const emails = normalizedId ? this.data.outboxEmails.filter((e) => e.patientId === normalizedId || e.patientId === patientId) : this.data.outboxEmails;
    return [...emails].reverse();
  }

  markEmailSent(id: string): void {
    const email = this.data.outboxEmails.find((e) => e.id === id);
    if (email) {
      email.status = 'SENT';
      email.sentAt = new Date().toISOString();
      this.persist();
    }
  }
}

// Global Singleton
const globalForDb = globalThis as unknown as { catalystDb: CatalystDatabase | undefined };
export const db = globalForDb.catalystDb ?? new CatalystDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.catalystDb = db;
