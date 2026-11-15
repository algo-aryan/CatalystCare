import { z } from 'zod';

/**
 * Medical dosage format validation
 * Enforces amount and valid clinical unit (e.g., "500 mg", "10ml", "1 tablet")
 */
export const DosageSchema = z.string()
  .min(1, 'Dosage is required')
  .max(50, 'Dosage string too long')
  .regex(/^\d+(\.\d+)?\s*(mg|mcg|g|ml|units?|IU|%|drops?|puffs?|tablets?|capsules?)$/i, {
    message: 'Dosage must include amount and valid clinical unit (e.g., "500 mg", "10 ml", "1 tablet")',
  });

export const ScheduledTimeSchema = z.string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Time must be in 24-hour HH:MM format (e.g., "08:00", "20:30")',
  });

export const MedicationCreateSchema = z.object({
  name: z.string().min(2, 'Medication name must be at least 2 characters').max(100).trim(),
  genericName: z.string().max(100).trim().optional(),
  dosage: DosageSchema,
  form: z.enum(['TABLET', 'CAPSULE', 'LIQUID', 'INJECTION', 'INHALER', 'DROPS', 'PATCH']).default('TABLET'),
  instructions: z.string().min(3, 'Instructions are required').max(500).trim(),
  foodRelation: z.enum(['BEFORE_MEAL', 'WITH_MEAL', 'AFTER_MEAL', 'NO_RESTRICTION']).default('NO_RESTRICTION'),
  scheduledTimes: z.array(ScheduledTimeSchema).min(1, 'At least one scheduled time is required'),
  isCritical: z.boolean().default(false),
  patientId: z.string().optional(),
});

export const CareLinkPairSchema = z.object({
  code: z.string().length(6, 'CareLink code must be exactly 6 characters').toUpperCase(),
  caregiverName: z.string().min(2, 'Caregiver name is required').max(80).trim(),
  caregiverEmail: z.string().email('Invalid email address').optional(),
});

export const AppointmentCreateSchema = z.object({
  doctorName: z.string().min(2, 'Doctor name is required').max(100).trim(),
  specialty: z.string().max(100).default('General Medicine'),
  clinicHospital: z.string().min(2, 'Clinic or hospital is required').max(150).trim(),
  appointmentTime: z.string().datetime({ message: 'Must be a valid ISO datetime string' }),
  contactNumber: z.string().optional(),
  reason: z.string().min(2, 'Reason is required').max(200).trim(),
  notes: z.string().max(500).optional(),
  patientId: z.string().optional(),
});
