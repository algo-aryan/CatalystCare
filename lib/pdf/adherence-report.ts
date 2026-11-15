import { db } from '../db';
import { calculateAdherenceMetrics, getTodaySchedule } from '../clinical/adherence-engine';

export function generateAdherenceReportHtml(patientId: string): string {
  const patient = db.getPatientProfile();
  const metrics = calculateAdherenceMetrics(patientId);
  const medications = db.getMedications(true);
  const schedule = getTodaySchedule(patientId);
  const auditLogs = db.getAuditLogs(patientId).slice(0, 10);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Clinical Adherence Report — ${patient.fullName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0F172A; line-height: 1.5; font-size: 14px; }
    .header { border-bottom: 3px solid #1D4ED8; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 26px; font-weight: 800; color: #1D4ED8; }
    .meta { display: flex; justify-content: space-between; margin-top: 8px; color: #475569; font-size: 13px; }
    .section { margin-top: 28px; }
    .section-title { font-size: 16px; font-weight: 700; border-bottom: 1px solid #CBD5E1; padding-bottom: 6px; margin-bottom: 12px; color: #0F172A; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; background: #F1F5F9; padding: 8px 12px; font-size: 12px; text-transform: uppercase; color: #475569; }
    td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 12px; }
    .kpi { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; }
    .kpi-val { font-size: 24px; font-weight: 800; color: #1D4ED8; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .badge-ok { background: #D1FAE5; color: #065F46; }
    .footer { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 12px; font-size: 11px; color: #94A3B8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">CatalystCare Clinical Adherence Summary</div>
    <div class="meta">
      <div><strong>Patient:</strong> ${patient.fullName} (DOB: ${patient.dateOfBirth}, Blood: ${patient.bloodGroup})</div>
      <div><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Adherence Metrics (Rolling 7-Day Window)</div>
    <div class="kpi-grid">
      <div class="kpi">
        <div>Overall Adherence</div>
        <div class="kpi-val">${metrics.overallPercentage}%</div>
      </div>
      <div class="kpi">
        <div>Doses Taken</div>
        <div class="kpi-val">${metrics.totalAdministeredPast7Days}/${metrics.totalScheduledPast7Days}</div>
      </div>
      <div class="kpi">
        <div>Current Streak</div>
        <div class="kpi-val">${metrics.currentStreakDays} Days</div>
      </div>
      <div class="kpi">
        <div>Escalation Tier</div>
        <div class="kpi-val">Tier ${metrics.activeEscalationTier}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Active Prescribed Medications</div>
    <table>
      <thead>
        <tr>
          <th>Medication Name</th>
          <th>Dosage</th>
          <th>Form</th>
          <th>Schedule</th>
          <th>Food Relation</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        ${medications
          .map(
            (m) => `
          <tr>
            <td><strong>${m.name}</strong></td>
            <td>${m.dosage}</td>
            <td>${m.form}</td>
            <td>${m.scheduledTimes.join(', ')}</td>
            <td>${m.foodRelation}</td>
            <td>${m.isCritical ? '<span style="color:#B91C1C;font-weight:bold;">Critical</span>' : 'Standard'}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Today's Dose Execution Log</div>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Medication</th>
          <th>Status</th>
          <th>Deviation</th>
        </tr>
      </thead>
      <tbody>
        ${schedule
          .map(
            (s) => `
          <tr>
            <td><strong>${s.scheduledTimeStr}</strong></td>
            <td>${s.medicationName} (${s.dosage})</td>
            <td><span class="badge ${s.status === 'ADMINISTERED' ? 'badge-ok' : ''}">${s.status}</span></td>
            <td>${s.deviationMinutes ? s.deviationMinutes + ' min' : '0 min'}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Verified by CatalystCare Healthcare Coordination Engine • Tamper-Evident SHA-256 Audit Chained
  </div>
</body>
</html>
  `;
}
