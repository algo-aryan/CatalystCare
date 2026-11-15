'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  ShieldCheck, 
  Users, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  CheckCircle,
  Stethoscope,
  FileText,
  MailCheck,
  Languages,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const [careLinkCode, setCareLinkCode] = useState('');
  const [caregiverName, setCaregiverName] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingResult, setPairingResult] = useState<{ 
    success: boolean; 
    message: string; 
    role?: string;
    redirectUrl?: string;
  } | null>(null);

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
          code: careLinkCode.trim().toUpperCase(),
          caregiverName: caregiverName.trim() || 'Rahul Sharma (Caretaker)',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const targetRole = data.targetRole || 'CARETAKER';
        setPairingResult({ 
          success: true, 
          message: data.message || `Successfully linked with ${targetRole} permissions!`, 
          role: targetRole,
          redirectUrl: `/clinical?role=${targetRole}`
        });
      } else {
        setPairingResult({ 
          success: false, 
          message: data.error || 'Invalid or expired passcode. Please verify or use demo code CARE99.' 
        });
      }
    } catch {
      setPairingResult({ success: false, message: 'Network error pairing CareLink passcode.' });
    } finally {
      setPairingLoading(false);
    }
  };

  const handleQuickFillDemoCode = (code: string, name: string) => {
    setCareLinkCode(code);
    setCaregiverName(name);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/30 via-slate-50 to-blue-50/40 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Branding */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Heart className="w-7 h-7 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">CatalystCare</h1>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  India Edition
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 tracking-wide">
                PromptWars x Catalyst 2026 • Build with AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold text-emerald-800">
                Shared Care Ecosystem Online
              </span>
            </div>
            <Link
              href="/api/reports/adherence?patientId=patient_savita_sharma"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-full text-slate-700 shadow-sm transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Export PDF Report</span>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center py-10 md:py-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold mb-4 border border-amber-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Elderly Care & Medication Management Platform
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-tight">
            Caring for Elders, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Connecting Families.</span>
          </h2>
          <p className="text-base md:text-xl text-slate-600 mt-4 max-w-2xl mx-auto font-medium">
            A shared, bilingual ecosystem empowering Indian seniors with voice-guided routines while keeping caretakers, doctors, and family interconnected with proactive alerts and Gemini clinical safety.
          </p>
        </section>

        {/* 3 Main Persona Selector Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Persona 1: Senior Patient */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-emerald-200 shadow-xl shadow-emerald-500/5 hover:border-emerald-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Heart className="w-8 h-8 fill-emerald-600" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
                Elderly Individual
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Savita Sharma (76)
              </h3>
              <p className="text-xs font-bold text-emerald-700">सविता शर्मा • नई दिल्ली</p>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                Large typography, bilingual Hindi/English voice readback, 1-tap <strong>&quot;I Took This Pill&quot;</strong> button, high-contrast AAA mode, zero cognitive burden.
              </p>
            </div>

            <Link
              href="/senior"
              className="mt-6 w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <span>Enter Senior Mode</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Persona 2: Primary Caregiver */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-xl shadow-blue-500/5 hover:border-blue-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-3 py-1 rounded-full">
                Primary Caretaker
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Rahul Sharma (Son)
              </h3>
              <p className="text-xs font-bold text-blue-700">राहुल शर्मा • Primary Caregiver</p>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                Manage medication prescriptions, schedule Fortis & Max doctor visits, verify drug interactions via Gemini AI, and trigger proactive notification scans.
              </p>
            </div>

            <Link
              href="/clinical?role=CARETAKER"
              className="mt-6 w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              <span>Open Caretaker Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Persona 3: Family Member */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-indigo-200 shadow-xl shadow-indigo-500/5 hover:border-indigo-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 bg-indigo-100/70 px-3 py-1 rounded-full">
                Family Member
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Priya Sharma (Daughter)
              </h3>
              <p className="text-xs font-bold text-indigo-700">प्रिया शर्मा • Bengaluru</p>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                Stay at peace from afar with real-time 7-day adherence charts, read-only audit log verification, upcoming appointment reminders, and automated emergency escalations.
              </p>
            </div>

            <Link
              href="/clinical?role=FAMILY_MEMBER"
              className="mt-6 w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <span>View Family Feed</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Passcode Pairing Section (CareLink HMAC Security) */}
        <section className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-md mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Secure Passcode Access (HMAC-SHA256 CareLink)
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                Pair with an Elder&apos;s Profile
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                Enter the 6-character passcode provided by Savita Sharma or the clinical coordinator to securely pair your device.
              </p>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600">Quick Test Demo Codes:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFillDemoCode('CARE99', 'Rahul Sharma (Caretaker)')}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-bold transition-all"
                >
                  Fill CARE99 (Caretaker)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillDemoCode('FAML77', 'Priya Sharma (Family)')}
                  className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-xs font-bold transition-all"
                >
                  Fill FAML77 (Family)
                </button>
              </div>
            </div>

            <form onSubmit={handleRedeemCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  6-Character CareLink Passcode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. CARE99"
                  value={careLinkCode}
                  onChange={(e) => setCareLinkCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 font-mono text-center tracking-widest text-2xl font-black text-slate-900 uppercase focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Your Full Name & Relationship
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma (Son & Caretaker)"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={pairingLoading || !careLinkCode.trim()}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {pairingLoading ? (
                  <span>Verifying HMAC Token...</span>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <span>Redeem Passcode & Open Profile</span>
                  </>
                )}
              </button>
            </form>

            {pairingResult && (
              <div
                className={`mt-4 p-4 rounded-2xl border flex flex-col gap-2 ${
                  pairingResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {pairingResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <span>{pairingResult.message}</span>
                </div>
                {pairingResult.success && pairingResult.redirectUrl && (
                  <Link
                    href={pairingResult.redirectUrl}
                    className="mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl text-center shadow-md transition-all"
                  >
                    Proceed to Paired Dashboard →
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16 text-center">
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Gemini Clinical AI</h4>
            <p className="text-xs text-slate-500 mt-1">
              Checks drug-drug & food-drug interactions before any prescription is added.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
              <MailCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Proactive Reminders</h4>
            <p className="text-xs text-slate-500 mt-1">
              Automated email reminders with 1-click &quot;Took It&quot; action links.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Languages className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Bilingual Voice</h4>
            <p className="text-xs text-slate-500 mt-1">
              Natural Hindi and Indian English audio synthesis adapted for elders.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Immutable Audit</h4>
            <p className="text-xs text-slate-500 mt-1">
              SHA-256 cryptographic hash-chain ensures tamper-evident medical logs.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 pb-8 border-t border-slate-200 pt-6">
          <p>CatalystCare • Built for Google for Developers PromptWars x Catalyst 2026</p>
          <p className="mt-1">Honoring Indian seniors with dignity, accessibility, and interconnected family care.</p>
        </footer>
      </div>
    </main>
  );
}
