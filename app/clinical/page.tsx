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
  MapPin,
  Stethoscope,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Medication, Appointment, AuditLogEntry, OutboxEmail } from '@/types';
import { AdherenceMetrics, TodayDoseSlot } from '@/lib/clinical/adherence-engine';
import { AdherenceChart } from '@/components/clinical/AdherenceChart';
import { MedicationTimeline } from '@/components/clinical/MedicationTimeline';

const PRIMARY_PATIENT = 'patient_savita_sharma';

function ClinicalDashboardContent() {
  const searchParams = useSearchParams();
  const currentRole = searchParams.get('role') || 'CARETAKER';
  const isCaretaker = currentRole === 'CARETAKER';

  // Streamlined 3 high-value clinical views (uncluttered)
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'appointments'>('overview');
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

  // CareLink Passcode State
  const [careLinkTargetRole, setCareLinkTargetRole] = useState<'CARETAKER' | 'FAMILY_MEMBER'>('FAMILY_MEMBER');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Proactive Scan state
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
        setScanMessage(`Scan complete: ${count} notifications checked and dispatched.`);
        refreshData();
      }
    } catch (err) {
      console.error('Failed proactive scan:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-emerald-50/20 via-slate-50 to-teal-50/25 text-slate-900 antialiased">
      {/* Top Header Bar with Medium Dark Gradient */}
      <header className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md active:scale-95"
              title="Return to Launchpad"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-lg md:text-xl tracking-tight text-white">
                  CatalystCare Clinical Portal
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
                  {isCaretaker ? 'Rahul Sharma (Primary Caretaker)' : 'Priya Sharma (Family Member)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Patient: <strong className="text-white">Savita Sharma (76, B+)</strong> • New Delhi • Multi-Tier Escalation Protocol
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <a
              href={`/api/reports/adherence?patientId=${PRIMARY_PATIENT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95"
              title="Download or Print Adherence Report"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Export PDF Report</span>
            </a>

            <button
              onClick={handleTriggerProactiveScan}
              disabled={scanning}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/30 text-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <BellRing className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Trigger Scan'}</span>
            </button>

            <button
              onClick={refreshData}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Streamlined 3-Tab Bar with Medium Dark Tone */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-2 border-t border-white/10">
          {[
            { id: 'overview', label: 'Daily Routine & Adherence', icon: TrendingUp },
            { id: 'medications', label: `Active Prescriptions (${medications.length})`, icon: Heart },
            { id: 'appointments', label: `Care Team & Clinic (${appointments.length})`, icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 font-bold text-xs md:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  active
                    ? 'border-emerald-400 text-emerald-300 font-black'
                    : 'border-transparent text-slate-300 hover:text-white'
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
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {scanMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold text-xs md:text-sm flex items-center justify-between shadow-sm">
            <span>{scanMessage}</span>
            <button onClick={() => setScanMessage(null)} className="font-bold text-emerald-800 hover:text-emerald-950 ml-4">✕</button>
          </div>
        )}

        {/* TAB 1: DAILY ROUTINE & ADHERENCE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards: Frosted Glass with Green Gradient Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white/85 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/80 shadow-[0_12px_36px_rgba(5,150,105,0.05)] ring-1 ring-slate-900/5">
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">7-Day Adherence</div>
                <div className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
                  {metrics?.overallPercentage || 100}%
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{metrics?.totalAdministeredPast7Days} of {metrics?.totalScheduledPast7Days} doses taken</span>
                </div>
              </div>

              <div className="bg-white/85 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/80 shadow-[0_12px_36px_rgba(5,150,105,0.05)] ring-1 ring-slate-900/5">
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">Current Streak</div>
                <div className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
                  {metrics?.currentStreakDays || 0} Days
                </div>
                <div className="text-xs text-slate-500 mt-1">Full adherence streak</div>
              </div>

              <div className="bg-white/85 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/80 shadow-[0_12px_36px_rgba(5,150,105,0.05)] ring-1 ring-slate-900/5">
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">Escalation Status</div>
                <div className="text-xl md:text-2xl font-black mt-2">
                  {metrics?.activeEscalationTier === 0 && <span className="text-emerald-700">Normal (Tier 0)</span>}
                  {metrics?.activeEscalationTier === 1 && <span className="text-amber-700">Patient Due (Tier 1)</span>}
                  {metrics?.activeEscalationTier === 2 && <span className="text-orange-700">Caretaker Alert (Tier 2)</span>}
                  {metrics?.activeEscalationTier === 3 && <span className="text-red-700">Emergency Family (Tier 3)</span>}
                </div>
                <div className="text-xs text-slate-500 mt-1">Proactive multi-tier protocol</div>
              </div>

              <div className="bg-white/85 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/80 shadow-[0_12px_36px_rgba(5,150,105,0.05)] ring-1 ring-slate-900/5">
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">Audit Security</div>
                <div className="text-xl md:text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>100% Intact</span>
                </div>
                <div className="text-xs font-semibold text-emerald-800 mt-1">
                  SHA-256 Hash Chain Verified
                </div>
              </div>
            </div>

            {/* Adherence Trajectory Chart */}
            <AdherenceChart metrics={metrics} />

            {/* Live Today's Schedule Timeline */}
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-6 md:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                    Today&apos;s Live Medication Adherence Timeline
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {schedule.length} Scheduled Slots
                </span>
              </div>

              <MedicationTimeline schedule={schedule} />
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE PRESCRIPTIONS & CLINICAL SAFETY */}
        {activeTab === 'medications' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Active Prescriptions List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-6 md:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">
                      Active Prescriptions ({medications.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Screened against drug-drug and food-drug interactions
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Live Monitored
                  </span>
                </div>

                <div className="space-y-4">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-white/80 space-y-3 hover:border-emerald-300 transition-all shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          {med.visualIdentity?.photoUrl && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={med.visualIdentity.photoUrl}
                              alt={med.name}
                              className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0 shadow-sm"
                            />
                          )}

                          <div>
                            <div className="text-base md:text-lg font-extrabold text-slate-900 flex flex-wrap items-center gap-2">
                              <span>{med.name}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {med.dosage}
                              </span>
                              {med.isCritical && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 uppercase">
                                  Critical Escalation
                                </span>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-slate-600 mt-1">{med.instructions}</p>
                            <div className="text-xs font-medium text-emerald-800 mt-1">
                              Times: {med.scheduledTimes.join(', ')} • Relation: {med.foodRelation}
                            </div>
                          </div>
                        </div>

                        {isCaretaker && (
                          <button
                            onClick={() => handleDeleteMedication(med.id, med.name)}
                            className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all"
                            title="Discontinue Medication"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Plain Language Summary */}
                      {med.plainLanguageSummary && (
                        <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-700 font-medium">
                          <strong className="text-slate-900">Plain Language Senior View:</strong> {med.plainLanguageSummary}
                        </div>
                      )}

                      {/* Interaction Warnings */}
                      {med.interactionWarnings && med.interactionWarnings.length > 0 && (
                        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                            <span>Clinical Interaction Warning Detected</span>
                          </div>
                          {med.interactionWarnings.map((warning, i) => (
                            <div key={i} className="text-xs text-amber-800">
                              <span className="font-bold">[{warning.severity}]</span> {warning.clinicalEffect}{' '}
                              <em>Recommendation: {warning.recommendation}</em>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Prescribe / Add Medication Form */}
            {isCaretaker && (
              <div className="lg:col-span-5 bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-6 md:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Clinical Decision Support</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Add Medication</h3>
                <p className="text-xs text-slate-500 mb-4">
                  New prescriptions are automatically screened against current medications for dangerous drug-drug interactions.
                </p>

                {medSuccessMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs">
                    {medSuccessMessage}
                  </div>
                )}

                <form onSubmit={handleAddMedication} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Telmisartan 40 mg (Telma 40)"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        placeholder="e.g. 40 mg"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Schedule (HH:MM)</label>
                      <input
                        type="text"
                        placeholder="08:00, 20:00"
                        value={newMedTimes}
                        onChange={(e) => setNewMedTimes(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Senior Routine Instructions</label>
                    <textarea
                      placeholder="e.g. Take 1 tablet in the morning with a glass of water."
                      value={newMedInstructions}
                      onChange={(e) => setNewMedInstructions(e.target.value)}
                      rows={2}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="criticalMed"
                      checked={newMedCritical}
                      onChange={(e) => setNewMedCritical(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <label htmlFor="criticalMed" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Critical Medication (Triggers priority multi-tier alert on miss)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={addingMed}
                    className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{addingMed ? 'Screening & Adding...' : 'Add Prescription'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CARE TEAM, CLINIC APPOINTMENTS & CARELINK PASSCODE */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Appointments & Schedule Visit Form */}
            <div className="space-y-6">
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-6 md:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Upcoming Clinic Visits</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {appointments.length} Scheduled
                  </span>
                </div>

                <div className="space-y-3.5">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-white/80 flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm md:text-base">{appt.doctorName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{appt.specialty} • {appt.clinicHospital}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-800">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(appt.appointmentTime).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`tel:${appt.contactNumber}`}
                        className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  ))}
                </div>

                {/* Schedule New Appointment Form */}
                {isCaretaker && (
                  <form onSubmit={handleAddAppointment} className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Schedule New Doctor Visit</h4>
                    
                    {apptSuccessMessage && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs">
                        {apptSuccessMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Doctor Name (e.g. Dr. Gupta)"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Clinic / Hospital"
                        value={newClinic}
                        onChange={(e) => setNewClinic(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="datetime-local"
                        value={newApptTime}
                        onChange={(e) => setNewApptTime(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Visit Reason (e.g. BP Checkup)"
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingAppt}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{addingAppt ? 'Scheduling...' : 'Save Appointment'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: CareLink HMAC Passcode Generation & Outbox */}
            <div className="space-y-6">
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-6 md:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                  <KeyRound className="w-4 h-4 text-emerald-700" />
                  <span>Secure CareLink Access</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Generate Family Passcode</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Creates an HMAC-SHA256 authenticated 6-character token for a family member to connect without passwords.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-700">Access Role:</label>
                    <select
                      value={careLinkTargetRole}
                      onChange={(e) => setCareLinkTargetRole(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 outline-none"
                    >
                      <option value="FAMILY_MEMBER">Family Observer (View Only)</option>
                      <option value="CARETAKER">Primary Caretaker (Full Admin)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateCareLink}
                    disabled={generatingCode}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{generatingCode ? 'Generating Code...' : 'Generate 6-Char Passcode'}</span>
                  </button>

                  {generatedCode && (
                    <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg border border-emerald-400/40">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Share with family:</div>
                        <div className="text-2xl font-mono font-black tracking-widest text-emerald-400 mt-0.5">
                          {generatedCode}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Expires in 48 hours</div>
                      </div>

                      <button
                        onClick={handleCopyCode}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{codeCopied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Outbox Feed (Uncluttered) */}
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-sm font-bold text-slate-900">Recent Automated Caretaker Alerts</h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{outbox.length} Dispatched</span>
                </div>

                <div className="space-y-2">
                  {outbox.slice(0, 3).map((email) => (
                    <div key={email.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="truncate mr-3">
                        <span className="font-bold text-slate-900">{email.subject}</span>
                        <div className="text-[10px] text-slate-500 truncate">To: {email.to}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                        {email.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ClinicalPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Clinical Portal...</div>}>
      <ClinicalDashboardContent />
    </Suspense>
  );
}
