import nodemailer from 'nodemailer';
import { db } from '../db';
import { signOneClickActionToken } from '../security/crypto';
import { OutboxEmail } from '@/types';

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Optional SMTP Transporter
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

/**
 * Sends or queues an accessible notification email
 */
export async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
  type: OutboxEmail['type'];
  patientId: string;
  oneClickToken?: string;
}): Promise<OutboxEmail> {
  const queued = db.enqueueEmail({
    to: params.to,
    subject: params.subject,
    html: params.html,
    type: params.type,
    patientId: params.patientId,
    oneClickToken: params.oneClickToken,
  });

  if (transporter && process.env.SMTP_USER) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CatalystCare" <alerts@catalystcare.org>',
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      db.markEmailSent(queued.id);
    } catch (e) {
      console.warn('[Notifier] SMTP send failed, keeping in Outbox queue:', e);
    }
  } else {
    // Simulated outbox mode for evaluation / demo
    db.markEmailSent(queued.id);
  }

  return queued;
}

/**
 * Triggers a proactive reminder for an upcoming medication dose
 */
export async function sendDoseReminderEmail(
  patientEmail: string,
  patientName: string,
  medName: string,
  dosage: string,
  timeStr: string,
  instructions: string,
  doseId: string,
  patientId: string
) {
  const oneClickToken = signOneClickActionToken(doseId, 'ADMINISTER', Date.now() + 24 * 3600 * 1000);
  const oneClickUrl = `${appBaseUrl}/api/doses/confirm?token=${oneClickToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; padding: 20px; font-size: 18px; line-height: 1.6; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 2px solid #CBD5E1; }
    .header { font-size: 24px; font-weight: bold; color: #1D4ED8; margin-bottom: 16px; }
    .med-box { background: #EFF6FF; border-left: 6px solid #1D4ED8; padding: 18px; border-radius: 8px; margin: 20px 0; }
    .btn { display: inline-block; background-color: #047857; color: #ffffff !important; padding: 18px 36px; font-size: 20px; font-weight: bold; text-decoration: none; border-radius: 12px; margin: 20px 0; text-align: center; }
    .footer { font-size: 14px; color: #64748B; margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">⏰ Medication Reminder</div>
    <p>Hello <strong>${patientName}</strong>,</p>
    <p>It is time for your scheduled medication:</p>
    
    <div class="med-box">
      <div style="font-size: 22px; font-weight: bold;">${medName} (${dosage})</div>
      <div style="margin-top: 6px; color: #334155;">Scheduled Time: <strong>${timeStr}</strong></div>
      <div style="margin-top: 4px; color: #334155;">Instructions: ${instructions}</div>
    </div>

    <p style="text-align: center;">
      <a href="${oneClickUrl}" class="btn">✓ I Have Taken This Dose</a>
    </p>

    <div class="footer">
      CatalystCare Connected Healthcare System • Your family and care team are kept informed.
    </div>
  </div>
</body>
</html>
  `;

  return dispatchEmail({
    to: patientEmail,
    subject: `⏰ Reminder: Time for your ${medName} (${dosage})`,
    html,
    type: 'DOSE_DUE',
    patientId,
    oneClickToken,
  });
}

/**
 * Triggers an Escalation Alert to Caretaker and Family on missed critical doses
 */
export async function sendCriticalEscalationEmail(
  caregiverEmail: string,
  caregiverName: string,
  patientName: string,
  medName: string,
  dosage: string,
  scheduledTime: string,
  patientId: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; background: #FFF1F2; color: #0F172A; padding: 20px; font-size: 18px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 3px solid #B91C1C; }
    .alert-header { color: #B91C1C; font-size: 24px; font-weight: bold; margin-bottom: 12px; }
    .badge { background: #FEE2E2; color: #B91C1C; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 14px; }
    .details { background: #F8FAFC; padding: 18px; border-radius: 8px; margin: 18px 0; border: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">URGENT CARE ESCALATION</div>
    <div class="alert-header" style="margin-top: 10px;">⚠️ Missed Critical Medication Alert</div>
    <p>Dear <strong>${caregiverName}</strong>,</p>
    <p>Our proactive monitoring system detected that <strong>${patientName}</strong> has not confirmed their scheduled critical medication.</p>

    <div class="details">
      <div><strong>Medication:</strong> ${medName} (${dosage})</div>
      <div><strong>Scheduled For:</strong> ${scheduledTime}</div>
      <div style="color: #B91C1C; margin-top: 6px;"><strong>Status:</strong> Overdue > 60 minutes</div>
    </div>

    <p>Please check in with ${patientName} to verify their well-being and assist with medication adherence.</p>

    <div style="margin-top: 24px; font-size: 14px; color: #64748B;">
      CatalystCare Automated Adherence Guardian • Sent automatically per care protocol.
    </div>
  </div>
</body>
</html>
  `;

  return dispatchEmail({
    to: caregiverEmail,
    subject: `🚨 URGENT: ${patientName} missed critical medication: ${medName}`,
    html,
    type: 'EMERGENCY_ESCALATION',
    patientId,
  });
}
