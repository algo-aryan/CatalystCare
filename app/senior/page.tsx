'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Volume2, 
  VolumeX, 
  Check, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Phone, 
  ArrowLeft, 
  Undo2, 
  Eye, 
  Sun,
  ShieldAlert
} from 'lucide-react';
import { TodayDoseSlot, AdherenceMetrics } from '@/lib/clinical/adherence-engine';
import { Appointment } from '@/types';

export default function SeniorModePage() {
  const [schedule, setSchedule] = useState<TodayDoseSlot[]>([]);
  const [metrics, setMetrics] = useState<AdherenceMetrics | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [lastAction, setLastAction] = useState<{ doseId: string; medName: string } | null>(null);
  const [undoTimer, setUndoTimer] = useState<number | null>(null);

  const fetchSeniorData = async () => {
    try {
      const [dosesRes, apptsRes] = await Promise.all([
        fetch('/api/doses?patientId=patient_eleanor_vance'),
        fetch('/api/appointments?patientId=patient_eleanor_vance'),
      ]);

      const dosesData = await dosesRes.json();
      const apptsData = await apptsRes.json();

      setSchedule(dosesData.schedule || []);
      setMetrics(dosesData.metrics || null);
      setAppointments(apptsData.appointments || []);
    } catch (err) {
      console.error('Failed to load senior data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeniorData();
    const interval = setInterval(fetchSeniorData, 15000); // Polling for live status
    return () => clearInterval(interval);
  }, []);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // Slower, clear voice for elderly
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleMarkTaken = async (slot: TodayDoseSlot) => {
    // Immediate optimistic update
    setSchedule((prev) =>
      prev.map((s) => (s.doseId === slot.doseId ? { ...s, status: 'ADMINISTERED' } : s))
    );

    // Speak confirmation
    speakText(`Good job Eleanor. You have taken your ${slot.medicationName}.`);

    // Setup 10-second undo buffer
    setLastAction({ doseId: slot.doseId, medName: slot.medicationName });
    if (undoTimer) clearTimeout(undoTimer);

    const timer = window.setTimeout(() => {
      setLastAction(null);
    }, 10000);
    setUndoTimer(timer);

    try {
      await fetch('/api/doses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doseId: slot.doseId,
          medicationId: slot.medicationId,
          patientId: 'patient_eleanor_vance',
          scheduledDateTime: slot.scheduledDateTime,
          status: 'ADMINISTERED',
          actorName: 'Eleanor Vance',
          actorRole: 'PATIENT',
          actorUserId: 'user_patient_eleanor',
          notes: 'Marked taken via Senior Mode single-tap interface',
        }),
      });
      fetchSeniorData();
    } catch (err) {
      console.error('Failed to record dose:', err);
    }
  };

  const handleSnooze = async (slot: TodayDoseSlot) => {
    speakText(`Reminder for ${slot.medicationName} snoozed for 30 minutes.`);
    try {
      await fetch('/api/doses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doseId: slot.doseId,
          medicationId: slot.medicationId,
          patientId: 'patient_eleanor_vance',
          scheduledDateTime: slot.scheduledDateTime,
          status: 'SNOOZED',
          actorName: 'Eleanor Vance',
          actorRole: 'PATIENT',
          actorUserId: 'user_patient_eleanor',
          notes: 'Snoozed for 30 minutes by patient',
        }),
      });
      fetchSeniorData();
    } catch (err) {
      console.error('Failed to snooze dose:', err);
    }
  };

  const nextDue = schedule.find((s) => s.status === 'DUE' || s.status === 'OVERDUE' || s.status === 'UPCOMING');
  const takenCount = schedule.filter((s) => s.status === 'ADMINISTERED').length;
  const totalCount = schedule.length;

  return (
    <main
      className={`min-h-screen pb-16 transition-colors duration-200 ${
        highContrast ? 'bg-white text-black' : 'bg-slate-50 text-slate-900'
      } ${largeFont ? 'text-xl' : 'text-base'}`}
    >
      {/* Top Accessibility Bar */}
      <nav
        aria-label="Accessibility & Persona Controls"
        className="bg-blue-900 text-white px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-b-4 border-blue-950"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white hover:text-blue-200 font-bold min-h-[48px] px-3 rounded-xl focus:ring-4 focus:ring-white outline-none"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Exit Senior Mode</span>
        </Link>

        {/* Accessibility Buttons (High Contrast & Large Font) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-4 py-2 rounded-xl font-bold border-2 flex items-center gap-2 min-h-[48px] focus:ring-4 focus:ring-yellow-400 outline-none ${
              highContrast ? 'bg-yellow-400 text-black border-black' : 'bg-blue-800 text-white border-blue-600'
            }`}
            aria-pressed={highContrast}
          >
            <Sun className="w-5 h-5" />
            <span>High Contrast: {highContrast ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setLargeFont(!largeFont)}
            className={`px-4 py-2 rounded-xl font-bold border-2 flex items-center gap-2 min-h-[48px] focus:ring-4 focus:ring-yellow-400 outline-none ${
              largeFont ? 'bg-yellow-400 text-black border-black' : 'bg-blue-800 text-white border-blue-600'
            }`}
            aria-pressed={largeFont}
          >
            <Eye className="w-5 h-5" />
            <span>Text: {largeFont ? 'Extra Large' : 'Normal'}</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Welcome Banner */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-blue-700 font-bold uppercase tracking-wider text-sm md:text-base">
                Good morning • Monday, Nov 15
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mt-1">
                Hello, Eleanor
              </h1>
            </div>

            {/* Daily Summary Pill */}
            <div className="bg-blue-100 border-2 border-blue-300 rounded-2xl px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-xl flex items-center justify-center">
                {takenCount}/{totalCount}
              </div>
              <div>
                <div className="font-extrabold text-blue-900 text-lg">Doses Taken Today</div>
                <div className="text-sm font-semibold text-blue-700">
                  {takenCount === totalCount ? '🎉 All done for today!' : `${totalCount - takenCount} remaining`}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Undo Notification Toast */}
        {lastAction && (
          <div className="mb-6 bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-bounce">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-emerald-400" />
              <span className="font-bold text-lg">Marked {lastAction.medName} as taken</span>
            </div>
            <button
              onClick={() => {
                setLastAction(null);
                fetchSeniorData();
              }}
              className="px-4 py-2 bg-yellow-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 hover:bg-yellow-300"
            >
              <Undo2 className="w-5 h-5" />
              Undo
            </button>
          </div>
        )}

        {/* FOCUS HERO: Next Medication Due Card */}
        {nextDue && (
          <section
            aria-labelledby="hero-dose-title"
            className="mb-10 bg-white rounded-3xl p-6 md:p-10 border-4 border-blue-600 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="bg-blue-600 text-white text-base md:text-lg font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                {nextDue.status === 'OVERDUE' ? '⚠️ Dose Overdue' : '⏰ Up Next Right Now'}
              </span>

              <button
                onClick={() =>
                  speakText(
                    `It is time for ${nextDue.medicationName}, ${nextDue.dosage}. Scheduled for ${nextDue.scheduledTimeStr}. ${nextDue.instructions}.`
                  )
                }
                className="flex items-center gap-2 text-blue-800 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-2xl font-bold min-h-[52px]"
                aria-label="Read directions aloud"
              >
                {speaking ? <VolumeX className="w-6 h-6 text-red-600" /> : <Volume2 className="w-6 h-6 text-blue-700" />}
                <span>{speaking ? 'Stop Voice' : 'Read Aloud'}</span>
              </button>
            </div>

            <div className="mt-2">
              <div className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                {nextDue.medicationName}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-blue-800 mt-2">
                {nextDue.dosage} • At {nextDue.scheduledTimeStr}
              </div>

              <div className="mt-6 p-4 md:p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <p className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed">
                  💡 {nextDue.instructions}
                </p>
                <p className="text-base text-blue-800 mt-2 font-medium">
                  {nextDue.foodRelation === 'WITH_MEAL' && '🍽️ Best taken with food or breakfast.'}
                </p>
              </div>
            </div>

            {/* Huge Touch Action Targets */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleMarkTaken(nextDue)}
                className="min-h-[72px] md:min-h-[84px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-2xl md:text-3xl font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/30 transition-all"
              >
                <Check className="w-8 h-8 stroke-[3]" />
                <span>I Took This Pill</span>
              </button>

              <button
                onClick={() => handleSnooze(nextDue)}
                className="min-h-[72px] md:min-h-[84px] bg-amber-100 hover:bg-amber-200 active:scale-[0.98] text-amber-900 border-2 border-amber-300 text-xl md:text-2xl font-bold rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                <Clock className="w-7 h-7" />
                <span>Remind in 30 Mins</span>
              </button>
            </div>
          </section>
        )}

        {/* Complete Today's Schedule Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <span>Today&apos;s Medicine Schedule</span>
          </h2>

          <div className="space-y-4">
            {schedule.map((slot) => {
              const isTaken = slot.status === 'ADMINISTERED';
              const isOverdue = slot.status === 'OVERDUE' || slot.status === 'MISSED';

              return (
                <div
                  key={slot.doseId}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isTaken
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : isOverdue
                      ? 'bg-red-50 border-red-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl ${
                        isTaken
                          ? 'bg-emerald-600 text-white'
                          : isOverdue
                          ? 'bg-red-600 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isTaken ? <Check className="w-8 h-8 stroke-[3]" /> : slot.scheduledTimeStr}
                    </div>

                    <div>
                      <div className="text-2xl font-black text-slate-900">{slot.medicationName}</div>
                      <div className="text-lg font-bold text-slate-600">
                        {slot.dosage} • {slot.instructions}
                      </div>

                      {isTaken && (
                        <span className="inline-block mt-2 text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          ✓ Taken on schedule
                        </span>
                      )}

                      {isOverdue && (
                        <span className="inline-block mt-2 text-sm font-bold text-red-800 bg-red-100 px-3 py-1 rounded-full">
                          ⚠️ Missed / Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {!isTaken && (
                    <button
                      onClick={() => handleMarkTaken(slot)}
                      className="min-h-[60px] px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl flex items-center justify-center gap-2"
                    >
                      <Check className="w-6 h-6" />
                      Take Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Doctor Appointments Card */}
        {appointments.length > 0 && (
          <section className="mb-12 bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-600" />
              <span>Upcoming Doctor Visit</span>
            </h2>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="text-2xl font-black text-slate-900">{appointments[0].doctorName}</div>
              <div className="text-lg font-bold text-blue-800 mt-1">{appointments[0].specialty}</div>
              <div className="text-base text-slate-700 mt-2 font-medium">
                📍 {appointments[0].clinicHospital}
              </div>
              <div className="text-base font-bold text-slate-900 mt-2">
                ⏰ {new Date(appointments[0].appointmentTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </section>
        )}

        {/* Emergency Contact Button */}
        <section className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Phone className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Need Assistance?</h3>
              <p className="text-lg font-medium text-slate-700">
                Your caregiver <strong>Marcus Vance</strong> is on standby.
              </p>
            </div>
          </div>

          <a
            href="tel:+15550198822"
            className="w-full md:w-auto min-h-[64px] px-8 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xl flex items-center justify-center gap-3 shadow-lg"
          >
            <Phone className="w-6 h-6" />
            <span>Call Marcus</span>
          </a>
        </section>
      </div>
    </main>
  );
}
