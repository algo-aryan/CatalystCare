'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  CheckCircle,
  Stethoscope,
  MailCheck,
  Languages,
  Lock,
  Volume2,
  CheckCircle2,
  Eye,
  Sliders
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
          message: data.message || `Successfully linked with ${targetRole} access`, 
          role: targetRole,
          redirectUrl: `/clinical?role=${targetRole}`
        });
      } else {
        setPairingResult({ 
          success: false, 
          message: data.error || 'Invalid or expired passcode. Try demo code CARE99.' 
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
    <main className="relative min-h-screen text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-950 p-4 md:p-8 lg:p-12 overflow-x-hidden">
      {/* 1. PHOTOREALISTIC FROSTED GLASS BACKGROUND IMAGE & AMBIENT CAUSTICS */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Generated subtle luxury frosted glass backdrop image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 mix-blend-multiply transition-opacity duration-700"
          style={{ backgroundImage: `url('/backgrounds/glass-bg.jpg'), url('/backgrounds/glass-ambient.svg')` }}
        />
        {/* Soft atmospheric gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-slate-50/70 to-emerald-50/40 backdrop-blur-[2px]" />
        
        {/* Ambient refractive glow orbs for floating glass depth */}
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-[36rem] h-[36rem] rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-[40rem] h-[40rem] rounded-full bg-emerald-100/40 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header: Clean, Refined & Distraction-Free (No PDF button, No green badges) */}
        <header className="flex items-center justify-between py-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                CatalystCare
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Dignified Senior Adherence & Connected Care
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Active Network</span>
          </div>
        </header>

        {/* Hero Section: Sophisticated Typography without AI badges */}
        <section className="text-center pt-14 pb-12 md:pt-20 md:pb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Dignified Elderly Care,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
              Interconnected Routine.
            </span>
          </h2>

          <p className="text-base md:text-lg text-slate-600 mt-5 max-w-2xl mx-auto font-medium leading-relaxed">
            Bridging bedside clarity for seniors with live telemetry, drug-drug screening, and automated multi-tier family escalation.
          </p>
        </section>

        {/* THREE FLOATING PORTAL CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-16">
          {/* Card 1: Senior Patient Portal */}
          <div className="group relative bg-white/75 backdrop-blur-2xl rounded-3xl p-8 border border-white/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-2.5 hover:shadow-[0_30px_70px_-15px_rgba(5,150,105,0.18)] transition-all duration-300 ease-out flex flex-col justify-between">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center mb-6 text-emerald-700 shadow-sm group-hover:scale-105 transition-transform">
                <Heart className="w-7 h-7 fill-emerald-600 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Senior Portal
                </span>
                <h3 className="text-2xl font-black text-slate-950">
                  Savita Sharma
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  76 Years • New Delhi
                </p>
              </div>

              <p className="text-slate-600 text-xs md:text-sm mt-4 leading-relaxed font-normal">
                Designed for independence with bedside pill macro photography, calming Indic voice guidance, and high-contrast one-tap dose logging.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 pt-5 border-t border-slate-100/80 space-y-2.5 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct Tablet Photo Identification</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bilingual Voice Guidance (Hindi & English)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>One-Tap Confirmation & Undo Window</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-2">
              <Link
                href="/senior"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm md:text-base text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98 transition-all"
              >
                <span>Enter Senior Mode</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Primary Caretaker Portal */}
          <div className="group relative bg-white/75 backdrop-blur-2xl rounded-3xl p-8 border border-white/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-2.5 hover:shadow-[0_30px_70px_-15px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out flex flex-col justify-between">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-800 to-slate-950 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 text-white shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Primary Caretaker
                </span>
                <h3 className="text-2xl font-black text-slate-950">
                  Rahul Sharma
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Son & Care Administrator
                </p>
              </div>

              <p className="text-slate-600 text-xs md:text-sm mt-4 leading-relaxed font-normal">
                Oversee clinical schedules, review automated drug interaction alerts, coordinate doctor reviews, and respond to missed dose alarms.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 pt-5 border-t border-slate-100/80 space-y-2.5 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Prescription & Routine Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Pharmacology & Interaction Warnings</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MailCheck className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Escalation Rules & Outbox Dispatch</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-2">
              <Link
                href="/clinical?role=CARETAKER"
                className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-sm md:text-base text-center flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-98 transition-all"
              >
                <span>Open Caretaker Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Family Observer Portal */}
          <div className="group relative bg-white/75 backdrop-blur-2xl rounded-3xl p-8 border border-white/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-2.5 hover:shadow-[0_30px_70px_-15px_rgba(13,148,136,0.18)] transition-all duration-300 ease-out flex flex-col justify-between">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-600 to-slate-800 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-50 to-slate-100 border border-teal-100 flex items-center justify-center mb-6 text-teal-800 shadow-sm group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7 text-teal-700" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Family Observer
                </span>
                <h3 className="text-2xl font-black text-slate-950">
                  Priya Sharma
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Daughter • Remote Telemetry
                </p>
              </div>

              <p className="text-slate-600 text-xs md:text-sm mt-4 leading-relaxed font-normal">
                Stay reassuringly connected from afar with real-time adherence streaks, cryptographic compliance checks, and emergency escalation alerts.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 pt-5 border-t border-slate-100/80 space-y-2.5 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Rolling 7-Day Adherence Trajectory</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Cryptographic Audit Verification</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Languages className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Multi-Recipient Escalation Feed</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-2">
              <Link
                href="/clinical?role=FAMILY_MEMBER"
                className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm md:text-base text-center flex items-center justify-center gap-2 shadow-lg shadow-slate-800/20 active:scale-98 transition-all"
              >
                <span>View Family Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECURE CARELINK PAIRING SECTION (Floating Frosted Glass Card) */}
        <section className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-white/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.06)] mb-16">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-7">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center mx-auto mb-3 text-slate-700">
                <KeyRound className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-2xl font-black text-slate-950">
                Pair with Elder Profile
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-1.5 font-normal">
                Enter your 6-character CareLink passcode to securely link your device.
              </p>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="mb-5 bg-slate-50/90 border border-slate-200/70 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">Quick Test Demo Codes:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFillDemoCode('CARE99', 'Rahul Sharma (Caretaker)')}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  CARE99 (Caretaker)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillDemoCode('FAML77', 'Priya Sharma (Family)')}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  FAML77 (Family)
                </button>
              </div>
            </div>

            <form onSubmit={handleRedeemCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  6-Character CareLink Passcode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. CARE99"
                  value={careLinkCode}
                  onChange={(e) => setCareLinkCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 font-mono text-center tracking-widest text-2xl font-black text-slate-900 uppercase focus:border-emerald-600 focus:outline-none transition-all bg-white/90"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Full Name & Relationship
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma (Son & Caretaker)"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 focus:border-emerald-600 focus:outline-none text-xs md:text-sm font-medium transition-all bg-white/90"
                />
              </div>

              <button
                type="submit"
                disabled={pairingLoading || !careLinkCode.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-98 transition-all shadow-lg shadow-emerald-700/20 disabled:opacity-50"
              >
                {pairingLoading ? (
                  <span>Verifying Passcode...</span>
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
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : 'bg-red-50/90 border-red-200 text-red-950'
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

        {/* Footer: Understated & Clean */}
        <footer className="text-center text-xs text-slate-500 pb-10 border-t border-slate-200/60 pt-8">
          <p className="font-semibold text-slate-700">CatalystCare Geriatric Adherence System</p>
          <p className="mt-1 text-slate-500">Accessible bedside technology and connected family care.</p>
        </footer>
      </div>
    </main>
  );
}
