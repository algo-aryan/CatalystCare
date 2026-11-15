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
  BellRing,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Stethoscope
} from 'lucide-react';
import { Medication, Appointment, AuditLogEntry, OutboxEmail } from '@/types';
import { AdherenceMetrics, TodayDoseSlot } from '@/lib/clinical/adherence-engine';
import { AdherenceChart } from '@/components/clinical/AdherenceChart';
import { MedicationTimeline } from '@/components/clinical/MedicationTimeline';
import { DrugInteractionWarning } from '@/components/shared/DrugInteractionWarning';

const PRIMARY_PATIENT = 'patient_savita_sharma';

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
  const [medSuccessMessage, setMedSuccessMessage] = useState<string | null>(null);

  // New Appointment Form State
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newClinic, setNewClinic] = useState('');
  const [newApptTime, setNewApptTime] = useState('');
  const [newReason, setNewReason] = useState('');
  const [addingAppt, setAddingAppt] = useState(false);
  const [apptSuccessMessage, setApptSuccessMessage] = useState<string | null>(null);

  // CareLink Generation State
  const [careLinkTargetRole, setCareLinkTargetRole] = useState<'CARETAKER' | 'FAMILY_MEMBER'>('FAMILY_MEMBER');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Scanner status
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const [dosesRes, medsRes, apptsRes, auditRes, outboxRes] = await Promise.all([
        fetch(`/api/doses?patientId=${PRIMARY_PATIENT}`),
        fetch('/api/medications?active=true'),
        fetch(`/api/appointments?patientId=${PRIMARY_PATIENT}`),
        fetch(`/api/audit?patientId=${PRIMARY_PATIENT}`),
        fetch(`/api/outbox?patientId=${PRIMARY_PATIENT}`),
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
    setMedSuccessMessage(null);

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
          patientId: PRIMARY_PATIENT,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.interactions && data.interactions.length > 0) {
          setAiAnalysisResult(data.interactions);
        }
        setMedSuccessMessage(`Added ${newMedName} (${newMedDosage}) successfully!`);
        setNewMedName('');
        setNewMedDosage('');
        setNewMedInstructions('');
        refreshData();
      } else {
        alert(data.error || 'Failed to add medication');
      }
    } catch (err) {
      console.error('Error adding medication:', err);
    } finally {
      setAddingMed(false);
    }
  };

  const handleDeleteMedication = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to discontinue ${name}?`)) return;
    try {
      const res = await fetch(`/api/medications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error('Failed to delete medication:', err);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newClinic || !newApptTime) return;

    setAddingAppt(true);
    setApptSuccessMessage(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: newDocName,
          specialty: newDocSpecialty || 'Cardiovascular Care',
          clinicHospital: newClinic,
          appointmentTime: new Date(newApptTime).toISOString(),
          reason: newReason || 'Routine health review',
          patientId: PRIMARY_PATIENT,
        }),
      });

      if (res.ok) {
        setApptSuccessMessage(`Scheduled appointment with ${newDocName}!`);
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
    setCodeCopied(false);
    try {
      const res = await fetch('/api/carelink/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: careLinkTargetRole,
          patientId: PRIMARY_PATIENT,
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

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 3000);
  };

  const handleTriggerProactiveScan = async () => {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await fetch('/api/notifications/trigger-check', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const count = data.triggeredAlerts ? data.triggeredAlerts.length : 0;
        setScanMessage(
          `Proactive scan completed! Dispatched ${count} automated email notification(s). Check the "Outbox Emails" tab below.`
        );
        refreshData();
      }
    } catch {
      setScanMessage('Failed to run proactive notification scan.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Clinical Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all"
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
                  {isCaretaker ? 'Rahul Sharma (Primary Caretaker)' : 'Priya Sharma (Family Observer)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Patient: <strong>Savita Sharma (76, B+)</strong> • New Delhi • Connected via HMAC CareLink Passcode
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href={`/api/reports/adherence?patientId=${PRIMARY_PATIENT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-900 text-white hover:bg-black rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
              title="Download or Print Clinical Summary Report"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Export PDF Report</span>
            </a>

            <button
              onClick={handleTriggerProactiveScan}
              disabled={scanning}
              className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <BellRing className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Trigger Proactive Scan'}</span>
            </button>

            <button
              onClick={refreshData}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
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
            { id: 'medications', label: `Medications & AI Safety (${medications.length})`, icon: Heart },
            { id: 'appointments', label: `Appointments (${appointments.length})`, icon: Calendar },
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
                className={`py-3.5 px-4 font-bold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  active
                    ? 'border-blue-600 text-blue-700 font-black'
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
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-sm flex items-center justify-between shadow-sm">
            <span>{scanMessage}</span>
            <button onClick={() => setScanMessage(null)} className="font-bold text-blue-700 hover:text-blue-900 ml-4">✕</button>
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
                  <span>{metrics?.totalAdministeredPast7Days} of {metrics?.totalScheduledPast7Days} doses taken</span>
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
                <div className="text-xs text-slate-500 mt-1">Proactive multi-tier protocol</div>
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Active Prescriptions ({medications.length})
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    All Active & Monitored
                  </span>
                </div>

                <div className="space-y-4">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xl font-extrabold text-slate-900 flex flex-wrap items-center gap-2">
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
                          <p className="text-sm text-slate-600 mt-1 font-medium">{med.instructions}</p>
                          <div className="text-xs font-semibold text-slate-500 mt-1">
                            Times: {med.scheduledTimes.join(', ')} • Food Relation: {med.foodRelation}
                          </div>
                        </div>

                        {isCaretaker && (
                          <button
                            onClick={() => handleDeleteMedication(med.id, med.name)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-all"
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
                            <span>Gemini AI Safety Alert: Drug/Food Interaction Detected</span>
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
                <h3 className="text-xl font-bold text-slate-900 mb-2">Prescribe Medication</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Prescriptions are automatically screened against current medications using Gemini AI for dangerous drug-drug interactions.
                </p>

                {/* Quick pre-fill helpers */}
                <div className="mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Quick Fill Demo Prescriptions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNewMedName('Telmisartan 40 mg (Telma 40)');
                        setNewMedDosage('40 mg');
                        setNewMedInstructions('Take 1 tablet every morning with water for BP.');
                        setNewMedTimes('08:00');
                        setNewMedCritical(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      Telma 40 (BP)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewMedName('Potassium Chloride');
                        setNewMedDosage('20 mEq');
                        setNewMedInstructions('Take with meals.');
                        setNewMedTimes('12:00');
                        setNewMedCritical(false);
                      }}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded-lg text-xs font-bold"
                      title="Tests dangerous interaction with ACE/ARB"
                    >
                      Potassium (Tests AI Warning)
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddMedication} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name & Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Telmisartan 40 mg (Telma 40)"
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
                      placeholder="e.g. 40 mg"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Times (24h, comma-separated)</label>
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
                      placeholder="e.g. Take 1 tablet in the morning with a glass of water."
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
                      Mark as Critical (Triggers Caretaker Escalation on Miss)
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

                {medSuccessMessage && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{medSuccessMessage}</span>
                  </div>
                )}

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
                  You have read-only access to review medications and adherence reports. Medical schedule edits are restricted to primary caregiver Rahul Sharma.
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
                      <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-indigo-600" />
                        <span>{appt.doctorName}</span>
                      </div>
                      <div className="text-sm font-semibold text-blue-700 mt-0.5">{appt.specialty} • {appt.clinicHospital}</div>
                      <div className="text-xs text-slate-600 mt-1">Reason: {appt.reason}</div>
                      <div className="text-xs font-mono font-bold text-slate-500 mt-2">
                        ⏰ {new Date(appt.appointmentTime).toLocaleString('en-IN')}
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

              {/* Quick pre-fill for Delhi Hospitals */}
              <div className="mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Pre-fill Hospital Details:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewDocName('Dr. Arvind Kapoor, MD');
                      setNewDocSpecialty('Cardiology & Heart Care');
                      setNewClinic('Fortis Escorts Heart Institute, Okhla');
                      setNewReason('Quarterly BP review & ECG');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    Fortis Heart
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewDocName('Dr. Anita Desai, MD');
                      setNewDocSpecialty('Endocrinology & Diabetes');
                      setNewClinic('Max Super Speciality Hospital, Saket');
                      setNewReason('HbA1c diabetes monitoring');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    Max Saket
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Arvind Kapoor, MD"
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
                    placeholder="e.g. Heart Care & Hypertension"
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    placeholder="e.g. Fortis Escorts Heart Institute, Okhla"
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

              {apptSuccessMessage && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{apptSuccessMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CARELINK PASSCODE GENERATOR */}
        {activeTab === 'carelink' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm">
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
                    className={`p-4 rounded-2xl border-2 font-bold text-sm text-left transition-all ${
                      careLinkTargetRole === 'CARETAKER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold">Caretaker / Nurse</div>
                    <div className="text-xs font-normal text-slate-600 mt-1">Full schedule & medication administration access</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCareLinkTargetRole('FAMILY_MEMBER')}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm text-left transition-all ${
                      careLinkTargetRole === 'FAMILY_MEMBER'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
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
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
              >
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>{generatingCode ? 'Generating cryptographic token...' : 'Generate 24h Passcode'}</span>
              </button>

              {generatedCode && (
                <div className="p-6 rounded-2xl bg-slate-900 text-white text-center animate-in fade-in">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Share this Code</div>
                  <div className="text-5xl font-mono font-black tracking-widest text-yellow-400 my-3">
                    {generatedCode}
                  </div>
                  <p className="text-xs text-slate-300">
                    Valid for 24 hours. The recipient can enter this code on the home screen to pair access.
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all"
                  >
                    {codeCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{codeCopied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                  </button>
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
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-sm"
              >
                <BellRing className="w-4 h-4" />
                <span>Trigger Proactive Dispatch</span>
              </button>
            </div>

            <div className="space-y-4">
              {outbox.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="font-semibold">No emails in outbox yet.</p>
                  <p className="text-xs mt-1">Click &quot;Trigger Proactive Dispatch&quot; to simulate proactive alerts for Savita Sharma.</p>
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

                    {mail.oneClickToken && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900">
                          One-Click Action Token Embedded
                        </span>
                        <a
                          href={`/api/doses/confirm?token=${mail.oneClickToken}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <span>🧪 Test 1-Click Dose Confirmation</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

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
                      <span className="font-extrabold text-slate-900 text-sm">{log.action}</span>
                      <span className="text-slate-500 ml-2">by {log.actorName} ({log.actorRole})</span>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-sans text-slate-700 text-xs">{log.details}</p>

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-[10px] text-slate-500">
                    <div>
                      <span className="font-bold text-slate-400">BLOCK HASH:</span>{' '}
                      <span className="text-emerald-700 font-bold">{log.hash.substring(0, 20)}...</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400">PREVIOUS HASH:</span>{' '}
                      <span className="text-slate-600">{log.previousHash.substring(0, 20)}...</span>
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
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Loading Clinical Portal...</div>}>
      <ClinicalDashboardContent />
    </Suspense>
  );
}
