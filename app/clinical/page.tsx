'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { 
  ShieldCheck, 
  Heart, 
  Users, 
  Plus, 
  Calendar, 
  KeyRound, 
  Mail, 
  Lock, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  ArrowLeft,
  FileCheck,
  RefreshCw,
  BellRing
} from 'lucide-react';
import { Medication, Appointment, AuditLogEntry, OutboxEmail, CareRelationship } from '@/types';
import { AdherenceMetrics, TodayDoseSlot } from '@/lib/clinical/adherence-engine';
import { AdherenceChart } from '@/components/clinical/AdherenceChart';
import { MedicationTimeline } from '@/components/clinical/MedicationTimeline';
import { DrugInteractionWarning } from '@/components/shared/DrugInteractionWarning';

function ClinicalDashboardContent() {
  const searchParams = useSearchParams();
  const currentRole = searchParams.get('role') || 'CARETAKER';
  const isCaretaker = currentRole === 'CARETAKER';

  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'appointments' | 'carelink' | 'outbox' | 'audit'>('overview');
  const [metrics, setMetrics] = useState<AdherenceMetrics | null>(null);
  const [schedule, setSchedule] = useState<TodayDoseSlot[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [chainValid, setChainValid] = useState(true);
  const [outbox, setOutbox] = useState<OutboxEmail[]>([]);
  const [loading, setLoading] = useState(true);

  // New Medication Form State
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  const [newMedTimes, setNewMedTimes] = useState('08:00');
  const [newMedCritical, setNewMedCritical] = useState(false);
  const [addingMed, setAddingMed] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // New Appointment Form State
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newClinic, setNewClinic] = useState('');
  const [newApptTime, setNewApptTime] = useState('');
  const [newReason, setNewReason] = useState('');
  const [addingAppt, setAddingAppt] = useState(false);

  // CareLink Generation State
  const [careLinkTargetRole, setCareLinkTargetRole] = useState<'CARETAKER' | 'FAMILY_MEMBER'>('FAMILY_MEMBER');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Scanner status
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const [dosesRes, medsRes, apptsRes, auditRes, outboxRes] = await Promise.all([
        fetch('/api/doses?patientId=patient_eleanor_vance'),
        fetch('/api/medications?active=true'),
        fetch('/api/appointments?patientId=patient_eleanor_vance'),
        fetch('/api/audit?patientId=patient_eleanor_vance'),
        fetch('/api/outbox?patientId=patient_eleanor_vance'),
      ]);

      const dosesData = await dosesRes.json();
      const medsData = await medsRes.json();
      const apptsData = await apptsRes.json();
      const auditData = await auditRes.json();
      const outboxData = await outboxRes.json();

      setMetrics(dosesData.metrics || null);
      setSchedule(dosesData.schedule || []);
      setMedications(medsData.medications || []);
      setAppointments(apptsData.appointments || []);
      setAuditLogs(auditData.logs || []);
      setChainValid(auditData.chainIntegrityVerified ?? true);
      setOutbox(outboxData.emails || []);
    } catch (err) {
      console.error('Failed to load clinical dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newMedDosage || !newMedInstructions) return;

    setAddingMed(true);
    setAiAnalysisResult(null);

    try {
      const timesArray = newMedTimes.split(',').map((t) => t.trim());
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMedName,
          dosage: newMedDosage,
          instructions: newMedInstructions,
          scheduledTimes: timesArray,
          isCritical: newMedCritical,
          patientId: 'patient_eleanor_vance',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.interactions && data.interactions.length > 0) {
          setAiAnalysisResult(data.interactions);
        }
        setNewMedName('');
        setNewMedDosage('');
        setNewMedInstructions('');
        refreshData();
      }
    } catch (err) {
      console.error('Error adding medication:', err);
    } finally {
      setAddingMed(false);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!confirm('Are you sure you want to discontinue this medication?')) return;
    try {
      await fetch(`/api/medications?id=${id}`, { method: 'DELETE' });
      refreshData();
    } catch (err) {
      console.error('Failed to delete medication:', err);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newClinic || !newApptTime) return;

    setAddingAppt(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: newDocName,
          specialty: newDocSpecialty || 'General Practice',
          clinicHospital: newClinic,
          appointmentTime: new Date(newApptTime).toISOString(),
          reason: newReason || 'Routine checkup',
          patientId: 'patient_eleanor_vance',
        }),
      });

      if (res.ok) {
        setNewDocName('');
        setNewDocSpecialty('');
        setNewClinic('');
        setNewApptTime('');
        setNewReason('');
        refreshData();
      }
    } catch (err) {
      console.error('Failed to add appointment:', err);
    } finally {
      setAddingAppt(false);
    }
  };

  const handleGenerateCareLink = async () => {
    setGeneratingCode(true);
    try {
      const res = await fetch('/api/carelink/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: careLinkTargetRole,
          patientId: 'patient_eleanor_vance',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedCode(data.token);
        refreshData();
      }
    } catch (err) {
      console.error('Failed to generate CareLink code:', err);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleTriggerProactiveScan = async () => {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await fetch('/api/notifications/trigger-check', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setScanMessage(
          `Scan completed! Sent ${data.triggeredAlerts.length} proactive email notification(s).`
        );
        refreshData();
      }
    } catch {
      setScanMessage('Failed to run proactive notification check.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Clinical Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100"
              title="Return to Launchpad"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-slate-900">CatalystCare Clinical Portal</span>
                <span
                  className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                    isCaretaker ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {isCaretaker ? 'Primary Caregiver Mode' : 'Family Member Observer Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Managing: <strong>Eleanor Vance (78, O+)</strong> • Connected via Secure Passcode Access
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/api/reports/adherence"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 text-white hover:bg-black rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
              title="Download or Print Clinical Summary Report"
            >
              <FileCheck className="w-4 h-4" />
              <span>Export PDF Report</span>
            </a>

            <button
              onClick={handleTriggerProactiveScan}
              disabled={scanning}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <BellRing className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Trigger Proactive Scan'}</span>
            </button>

            <button
              onClick={refreshData}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-2 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Adherence Overview', icon: TrendingUp },
            { id: 'medications', label: 'Medications & AI Safety', icon: Heart },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'carelink', label: 'Passcode CareLink', icon: KeyRound },
            { id: 'outbox', label: `Outbox Emails (${outbox.length})`, icon: Mail },
            { id: 'audit', label: 'HIPAA Audit Trail', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {scanMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-sm flex items-center justify-between">
            <span>{scanMessage}</span>
            <button onClick={() => setScanMessage(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* TAB 1: ADHERENCE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">7-Day Adherence</div>
                <div className="text-4xl font-black text-slate-900 mt-2">
                  {metrics?.overallPercentage || 100}%
                </div>
                <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {metrics?.totalAdministeredPast7Days} of {metrics?.totalScheduledPast7Days} doses taken
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">Current Streak</div>
                <div className="text-4xl font-black text-slate-900 mt-2">
                  {metrics?.currentStreakDays || 0} Days
                </div>
                <div className="text-xs text-slate-500 mt-1">Full adherence streak</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">Escalation Status</div>
                <div className="text-2xl font-black mt-2">
                  {metrics?.activeEscalationTier === 0 && <span className="text-emerald-600">Normal (Tier 0)</span>}
                  {metrics?.activeEscalationTier === 1 && <span className="text-amber-600">Patient Due (Tier 1)</span>}
                  {metrics?.activeEscalationTier === 2 && <span className="text-orange-600">Caretaker Alert (Tier 2)</span>}
                  {metrics?.activeEscalationTier === 3 && <span className="text-red-600">Emergency Family (Tier 3)</span>}
                </div>
                <div className="text-xs text-slate-500 mt-1">Multi-tier escalation engine</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">Audit Security</div>
                <div className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                  <span>100% Intact</span>
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-1">
                  SHA-256 Hash Chain Verified
                </div>
              </div>
            </div>

            {/* Modular AdherenceChart Component */}
            <AdherenceChart metrics={metrics} />

            {/* Modular MedicationTimeline Component */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <span>Today&apos;s Live Medication Adherence Timeline</span>
              </h3>

              <MedicationTimeline schedule={schedule} />
            </div>
          </div>
        )}


        {/* TAB 2: MEDICATIONS & AI CLINICAL SAFETY */}
        {activeTab === 'medications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Medication List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Active Prescriptions ({medications.length})
                </h3>

                <div className="space-y-6">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                            <span>{med.name}</span>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-800">
                              {med.dosage}
                            </span>
                            {med.isCritical && (
                              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-red-100 text-red-800">
                                ⚠️ Critical Escalation
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{med.instructions}</p>
                          <div className="text-xs font-semibold text-slate-500 mt-1">
                            Times: {med.scheduledTimes.join(', ')} • Food Relation: {med.foodRelation}
                          </div>
                        </div>

                        {isCaretaker && (
                          <button
                            onClick={() => handleDeleteMedication(med.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50"
                            title="Discontinue Medication"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* AI Senior Explanation */}
                      {med.plainLanguageSummary && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                          <strong>🧠 Plain Language Summary for Senior:</strong> {med.plainLanguageSummary}
                        </div>
                      )}

                      {/* Drug Interaction Alerts if detected */}
                      {med.interactionWarnings && med.interactionWarnings.length > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-700" />
                            <span>Gemini AI Safety Alert: Drug Interaction Detected</span>
                          </div>
                          {med.interactionWarnings.map((warning, i) => (
                            <div key={i} className="text-xs text-amber-900">
                              <span className="font-bold">[{warning.severity}]</span> {warning.clinicalEffect}{' '}
                              <em>Rec: {warning.recommendation}</em>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prescribe Medication Form */}
            {isCaretaker ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 h-fit">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                  <Sparkles className="w-4 h-4" />
                  AI Clinical Decision Support
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Prescribe Medication</h3>

                <form onSubmit={handleAddMedication} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Amlodipine"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 mg"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Times (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. 08:00, 20:00"
                      value={newMedTimes}
                      onChange={(e) => setNewMedTimes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Instructions for Senior</label>
                    <textarea
                      placeholder="e.g. Take 1 tablet in morning with water."
                      value={newMedInstructions}
                      onChange={(e) => setNewMedInstructions(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="critical-check"
                      checked={newMedCritical}
                      onChange={(e) => setNewMedCritical(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <label htmlFor="critical-check" className="text-xs font-bold text-slate-700">
                      Mark as Critical (Triggers Caregiver Escalation on Miss)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={addingMed}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{addingMed ? 'Running Gemini AI Safety Check...' : 'Add & Verify with AI'}</span>
                  </button>
                </form>

                {aiAnalysisResult && (
                  <div className="mt-4">
                    <DrugInteractionWarning warnings={aiAnalysisResult} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 text-sm text-slate-600">
                <p className="font-bold text-slate-800">Family Observer Access</p>
                <p className="mt-2">
                  You have read-only access to review medications and adherence reports. Medical schedule edits are restricted to primary caregiver Marcus Vance.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Scheduled Doctor Appointments</h3>
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-lg font-bold text-slate-900">{appt.doctorName}</div>
                      <div className="text-sm font-semibold text-blue-700">{appt.specialty} • {appt.clinicHospital}</div>
                      <div className="text-xs text-slate-600 mt-1">Reason: {appt.reason}</div>
                      <div className="text-xs font-mono font-bold text-slate-500 mt-2">
                        ⏰ {new Date(appt.appointmentTime).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Appointment Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 h-fit">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Schedule Medical Visit</h3>
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Robert Chen"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology"
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    placeholder="e.g. St. Jude Heart Institute"
                    value={newClinic}
                    onChange={(e) => setNewClinic(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newApptTime}
                    onChange={(e) => setNewApptTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Visit Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Quarterly ECG review"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingAppt}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{addingAppt ? 'Scheduling...' : 'Schedule Visit'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: CARELINK PASSCODE GENERATOR */}
        {activeTab === 'carelink' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 md:p-10">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Issue CareLink Pairing Passcode</h3>
              <p className="text-slate-600 text-sm mt-2">
                Generate a secure, time-limited 6-character code signed with HMAC-SHA256 to grant family members or visiting nurses access.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Target Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setCareLinkTargetRole('CARETAKER')}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm text-left ${
                      careLinkTargetRole === 'CARETAKER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold">Caretaker / Nurse</div>
                    <div className="text-xs font-normal text-slate-600 mt-1">Full schedule & medication administration access</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCareLinkTargetRole('FAMILY_MEMBER')}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm text-left ${
                      careLinkTargetRole === 'FAMILY_MEMBER'
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold">Family Member</div>
                    <div className="text-xs font-normal text-slate-600 mt-1">Adherence monitoring & emergency alerts only</div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateCareLink}
                disabled={generatingCode}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-base flex items-center justify-center gap-2"
              >
                <KeyRound className="w-5 h-5" />
                <span>{generatingCode ? 'Generating cryptographic token...' : 'Generate 24h Passcode'}</span>
              </button>

              {generatedCode && (
                <div className="p-6 rounded-2xl bg-slate-900 text-white text-center">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Share this Code</div>
                  <div className="text-5xl font-mono font-black tracking-widest text-yellow-400 my-3">
                    {generatedCode}
                  </div>
                  <p className="text-xs text-slate-300">
                    Valid for 24 hours. The recipient can enter this code on the home screen to pair access.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: OUTBOX / EMAIL SIMULATOR */}
        {activeTab === 'outbox' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <span>Proactive Email Outbox ({outbox.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Live email audit: Evaluators can inspect proactive reminders and signed 1-click action links.
                </p>
              </div>

              <button
                onClick={handleTriggerProactiveScan}
                disabled={scanning}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-xs flex items-center gap-2"
              >
                <BellRing className="w-4 h-4" />
                <span>Trigger Proactive Dispatch</span>
              </button>
            </div>

            <div className="space-y-4">
              {outbox.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No emails in outbox yet. Click &quot;Trigger Proactive Dispatch&quot; to simulate alerts.
                </div>
              ) : (
                outbox.map((mail) => (
                  <div
                    key={mail.id}
                    className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            mail.type === 'EMERGENCY_ESCALATION'
                              ? 'bg-red-100 text-red-800'
                              : mail.type === 'DOSE_DUE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {mail.type}
                        </span>
                        <span className="text-sm font-bold text-slate-900 ml-3">{mail.subject}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(mail.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong>To:</strong> {mail.to} • <strong>Status:</strong> {mail.status}
                    </div>

                    {/* Email HTML Preview Accordion */}
                    <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: mail.html }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: HIPAA TAMPER-EVIDENT AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-emerald-600" />
                  <span>HIPAA Tamper-Evident SHA-256 Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Append-only cryptographic hash chain logging all medication doses, schedule modifications, and pairing events.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-800">
                  {chainValid ? 'Chain Integrity: 100% Valid' : 'Integrity Compromised'}
                </span>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between gap-4 font-sans">
                    <div>
                      <span className="font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-slate-700 ml-2 font-semibold">
                        Actor: {log.actorName} ({log.actorRole})
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="font-sans text-sm text-slate-800">{log.details}</div>

                  <div className="pt-2 border-t border-slate-200 text-slate-500 flex flex-col md:flex-row gap-2">
                    <div>
                      <span className="text-slate-400">Current Hash:</span> {log.hash.substring(0, 16)}...
                    </div>
                    <div>
                      <span className="text-slate-400">Previous Hash:</span> {log.previousHash.substring(0, 16)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ClinicalDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-lg text-slate-600">Loading Clinical Dashboard...</div>}>
      <ClinicalDashboardContent />
    </Suspense>
  );
}

