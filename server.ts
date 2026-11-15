import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import cron from 'node-cron';
import { db } from './lib/db';
import { getTodaySchedule, calculateAdherenceMetrics } from './lib/clinical/adherence-engine';
import { sendDoseReminderEmail, sendCriticalEscalationEmail } from './lib/notifications/notifier';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function runScheduledProactiveChecks() {
  console.log('[Scheduler] Running 5-minute proactive adherence check...');
  try {
    const patientId = 'patient_eleanor_vance';
    const patient = db.getPatientProfile();
    const patientUser = db.getUserById(patient.userId);
    const relationships = db.getCareRelationships().filter((r) => r.patientId === patientId && r.status === 'ACTIVE');
    const schedule = getTodaySchedule(patientId);

    for (const slot of schedule) {
      if (slot.status === 'DUE' && patientUser) {
        await sendDoseReminderEmail(
          patientUser.email,
          patient.fullName,
          slot.medicationName,
          slot.dosage,
          slot.scheduledTimeStr,
          slot.instructions,
          slot.doseId,
          patientId
        );
      }

      if (slot.isCritical && (slot.status === 'OVERDUE' || slot.status === 'MISSED')) {
        for (const rel of relationships) {
          const caregiverUser = db.getUserById(rel.caregiverUserId);
          const email = caregiverUser?.email || (rel.role === 'CARETAKER' ? 'marcus.vance@gmail.com' : 'sarah.vance@outlook.com');
          await sendCriticalEscalationEmail(
            email,
            rel.caregiverName,
            patient.fullName,
            slot.medicationName,
            slot.dosage,
            slot.scheduledTimeStr,
            patientId
          );
        }
      }
    }
  } catch (err) {
    console.error('[Scheduler] Error during adherence check:', err);
  }
}

app.prepare().then(() => {
  // Start background cron jobs
  // Check due medications every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    runScheduledProactiveChecks();
  });

  // Daily appointment reminder check at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    console.log('[Scheduler] Daily appointment reminder check fired.');
  });

  console.log('[CatalystCare] node-cron proactive notification scheduler initialized.');

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, () => {
    console.log(`> CatalystCare server ready on http://${hostname}:${port}`);
  });
});
