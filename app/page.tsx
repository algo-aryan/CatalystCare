'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Users, Clock, Sparkles, ArrowRight, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [careLinkCode, setCareLinkCode] = useState('');
  const [caregiverName, setCaregiverName] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingResult, setPairingResult] = useState<{ success: boolean; message: string; role?: string } | null>(null);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careLinkCode.trim()) return;

    setPairingLoading(true);
    setPairingResult(null);

    try {
      const res = await fetch('/api/carelink/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: careLinkCode.trim(),
          caregiverName: caregiverName.trim() || 'Dr. Carter (Caretaker)',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPairingResult({ success: true, message: data.message, role: data.targetRole });
      } else {
        setPairingResult({ success: false, message: data.error || 'Failed to redeem passcode' });
      }
    } catch {
      setPairingResult({ success: false, message: 'Network error pairing CareLink passcode.' });
    } finally {
      setPairingLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Branding */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Heart className="w-7 h-7 fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">CatalystCare</h1>
              <p className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
                Google for Developers • Build with AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800">Healthcare Ecosystem Active</span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center py-10 md:py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            PromptWars x Catalyst 2026 Submission
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Intelligent Elderly Care & Medication Management
          </h2>
          <p className="text-base md:text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
            Empowering seniors with accessible, voice-guided routines while keeping caretakers and family securely interconnected with proactive email alerts.
          </p>
        </section>

        {/* Persona Switcher Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Senior Patient */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-xl shadow-blue-500/5 hover:border-blue-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Elderly Individual
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-3">Eleanor Vance (78)</h3>
              <p className="text-slate-600 text-sm mt-2">
                Large 24px+ typography, voice readback, 1-tap &quot;I Took This&quot; confirmation, high-contrast, zero clutter.
              </p>
            </div>

            <Link
              href="/senior"
              className="mt-6 w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg text-center flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              Enter Senior Mode
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Card 2: Caretaker */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-emerald-200 shadow-xl shadow-emerald-500/5 hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Primary Caregiver
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-3">Marcus Vance (Son)</h3>
              <p className="text-slate-600 text-sm mt-2">
                7-day adherence analytics, AI drug-drug interaction checker, appointment scheduler, live email outbox.
              </p>
            </div>

            <Link
              href="/clinical?role=CARETAKER"
              className="mt-6 w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg text-center flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Caretaker Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Card 3: Family Member */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-purple-200 shadow-xl shadow-purple-500/5 hover:border-purple-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                Family Observer
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-3">Sarah Vance (Daughter)</h3>
              <p className="text-slate-600 text-sm mt-2">
                Peace-of-mind adherence score, emergency escalation alerts, appointment calendar, read-only audit log.
              </p>
            </div>

            <Link
              href="/clinical?role=FAMILY_MEMBER"
              className="mt-6 w-full py-4 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg text-center flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
            >
              Family View
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Passcode-Based Access Section (CareLink Pairing) */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              Secure Passcode-Based Onboarding
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Have a 6-Character CareLink Passcode?</h3>
            <p className="text-slate-600 text-sm mt-1">
              Elderly individuals can grant access to caretakers and family members using a secure, time-limited 6-character code.
            </p>

            <form onSubmit={handleRedeemCode} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Caregiver Name"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
              />
              <input
                type="text"
                placeholder="Code: e.g. CARE99"
                maxLength={6}
                value={careLinkCode}
                onChange={(e) => setCareLinkCode(e.target.value.toUpperCase())}
                className="px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-base font-mono uppercase tracking-widest text-center w-full sm:w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={pairingLoading}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-base transition-colors disabled:opacity-50"
              >
                {pairingLoading ? 'Verifying...' : 'Link Access'}
              </button>
            </form>

            {pairingResult && (
              <div
                className={`mt-4 p-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold ${
                  pairingResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {pairingResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                <span>{pairingResult.message}</span>
                {pairingResult.success && (
                  <Link href={`/clinical?role=${pairingResult.role}`} className="underline font-bold ml-2">
                    Open Dashboard →
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Key Innovations Checklist */}
        <section className="bg-slate-900 rounded-3xl p-8 text-white mb-10">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            Beyond Basic Reminders
          </div>
          <h3 className="text-2xl font-bold mb-6">Why CatalystCare Leads the Evaluation Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
              <div>
                <strong className="text-white block">Event-Sourced Adherence State Machine</strong>
                Tracks SCHEDULED, UPCOMING, DUE, ADMINISTERED, SNOOZED, OVERDUE, and MISSED with exact minute deviations.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
              <div>
                <strong className="text-white block">Google Gemini AI Drug-Drug Interaction Safety</strong>
                Analyzes new prescriptions against active medications & medical history for contraindications and food warnings.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
              <div>
                <strong className="text-white block">Proactive Multi-Tier Notification Outbox</strong>
                Sends 1-click &quot;Mark Taken&quot; email reminders, missed alerts, and auto-escalates critical missed doses to caregivers.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
              <div>
                <strong className="text-white block">Tamper-Evident SHA-256 Audit Log</strong>
                HIPAA-ready cryptographic hash chain recording all medication doses, schedule edits, and passcode pairing events.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
