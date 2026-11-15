'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  ShieldCheck, 
  Users, 
  Clock, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  CheckCircle,
  Stethoscope,
  FileText,
  MailCheck,
  Languages,
  CheckCircle2,
  Lock,
  Activity,
  HeartHandshake
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
    <main className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/30 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header Branding */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 border-b border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-tight text-slate-950">
                  CatalystCare
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Geriatric Healthcare
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Shared Medication Adherence & Multi-Tier Family Care
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-emerald-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-900">
                Care Network Online
              </span>
            </div>

            <Link
              href="/api/reports/adherence?patientId=patient_savita_sharma"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/90 border border-slate-200 hover:bg-white px-3.5 py-1.5 rounded-full text-slate-700 shadow-sm transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export PDF Report</span>
            </Link>
          </div>
        </header>

        {/* Hero Section: Modern & Gradient-Infused */}
        <section className="text-center py-12 md:py-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-4 border border-emerald-200/80 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            <span>Connected Healthcare for Seniors & Families</span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-tight">
            Dignified Elderly Care,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
              Interconnected Routine.
            </span>
          </h2>

          <p className="text-sm md:text-lg text-slate-600 mt-4 max-w-2xl mx-auto font-medium leading-relaxed">
            A unified clinical ecosystem combining voice-guided schedules and bedside pill recognition for seniors with real-time adherence tracking and family emergency escalations.
          </p>
        </section>

        {/* 3 Main Persona Selector Cards: Frosted Glass with Gradient Accents */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Persona 1: Senior Patient */}
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/80 shadow-[0_12px_36px_rgba(5,150,105,0.06)] ring-1 ring-slate-900/5 hover:border-emerald-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-center mb-5 text-emerald-800 shadow-sm group-hover:scale-105 transition-transform">
                <Heart className="w-7 h-7 fill-emerald-600 text-emerald-600" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100/70 px-3 py-1 rounded-full">
                Elderly Individual
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Savita Sharma (76)
              </h3>
              <p className="text-xs font-bold text-emerald-800">सविता शर्मा • New Delhi</p>
              <p className="text-slate-600 text-xs md:text-sm mt-3 leading-relaxed">
                Direct bedside pill recognition, natural Indic voice playback, simplified one-tap dose confirmation, and large accessible controls.
              </p>
            </div>

            <Link
              href="/senior"
              className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm md:text-base text-center flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
            >
              <span>Enter Senior Mode</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Persona 2: Primary Caretaker */}
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/80 shadow-[0_12px_36px_rgba(5,150,105,0.06)] ring-1 ring-slate-900/5 hover:border-emerald-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-900 to-emerald-950 flex items-center justify-center mb-5 text-white shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Primary Caretaker
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Rahul Sharma (Son)
              </h3>
              <p className="text-xs font-bold text-slate-600">Primary Caregiver & Admin</p>
              <p className="text-slate-600 text-xs md:text-sm mt-3 leading-relaxed">
                Prescribe medications, screen drug-drug interactions, schedule cardiologist reviews, and monitor live adherence telemetry.
              </p>
            </div>

            <Link
              href="/clinical?role=CARETAKER"
              className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-sm md:text-base text-center flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <span>Open Caretaker Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Persona 3: Family Member */}
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/80 shadow-[0_12px_36px_rgba(5,150,105,0.06)] ring-1 ring-slate-900/5 hover:border-emerald-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-50 to-emerald-50 border border-teal-200 flex items-center justify-center mb-5 text-teal-800 shadow-sm group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7 text-teal-700" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900 bg-teal-100/70 px-3 py-1 rounded-full">
                Family Observer
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Priya Sharma (Daughter)
              </h3>
              <p className="text-xs font-bold text-teal-800">Bengaluru • Remote Monitoring</p>
              <p className="text-slate-600 text-xs md:text-sm mt-3 leading-relaxed">
                Reassurance from afar with rolling 7-day adherence charts, cryptographic audit verification, and automated emergency alert dispatches.
              </p>
            </div>

            <Link
              href="/clinical?role=FAMILY_MEMBER"
              className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm md:text-base text-center flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <span>View Family Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Secure Passcode Pairing Section: Frosted Glass */}
        <section className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/80 shadow-[0_12px_36px_rgba(5,150,105,0.05)] ring-1 ring-slate-900/5 mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-2">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>HMAC-SHA256 Authenticated CareLink Access</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                Pair with Elder Profile
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-1">
                Enter the 6-character access passcode generated by the patient or clinical admin to securely link your device.
              </p>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="mb-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600">Quick Test Demo Codes:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFillDemoCode('CARE99', 'Rahul Sharma (Caretaker)')}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  CARE99 (Caretaker)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillDemoCode('FAML77', 'Priya Sharma (Family)')}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  FAML77 (Family)
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
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 font-mono text-center tracking-widest text-2xl font-black text-slate-900 uppercase focus:border-emerald-600 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name & Relationship
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma (Son & Caretaker)"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 focus:border-emerald-600 focus:outline-none text-xs md:text-sm font-medium transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={pairingLoading || !careLinkCode.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50"
              >
                {pairingLoading ? (
                  <span>Verifying HMAC Token...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-emerald-100" />
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
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{pairingResult.message}</span>
                </div>
                {pairingResult.success && pairingResult.redirectUrl && (
                  <Link
                    href={pairingResult.redirectUrl}
                    className="mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl text-center shadow-md transition-all"
                  >
                    Proceed to Paired Dashboard →
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Core Architectural Pillars */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14 text-center">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm md:text-base">Clinical Safety Screener</h4>
            <p className="text-xs text-slate-500 mt-1">
              Automated screening against known drug-drug and food-drug interactions.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <MailCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm md:text-base">Multi-Tier Escalation</h4>
            <p className="text-xs text-slate-500 mt-1">
              Automated caregiver alerts with one-click direct confirmation tokens.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Languages className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm md:text-base">Bilingual Voice Guidance</h4>
            <p className="text-xs text-slate-500 mt-1">
              Natural Hindi and English audio synthesized specifically for elderly pacing.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm md:text-base">Cryptographic Audit</h4>
            <p className="text-xs text-slate-500 mt-1">
              SHA-256 tamper-evident hash-chain ensures complete auditability.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 pb-8 border-t border-slate-200/80 pt-6">
          <p className="font-semibold text-slate-700">CatalystCare Geriatric Adherence System</p>
          <p className="mt-1">Empowering seniors with accessible, dignified, and interconnected family care.</p>
        </footer>
      </div>
    </main>
  );
}
