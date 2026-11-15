'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Check, 
  Clock, 
  Calendar, 
  Phone, 
  ArrowLeft, 
  Undo2 
} from 'lucide-react';
import { useAdherence } from '@/hooks/useAdherence';
import { useVoiceAnnouncement } from '@/hooks/useVoiceAnnouncement';
import { MedicationCard } from '@/components/senior/MedicationCard';
import { AccessibilityToolbar } from '@/components/shared/AccessibilityToolbar';
import { Appointment } from '@/types';

export default function SeniorModePage() {
  const { schedule, nextDueSlot, takenCount, totalCount, confirmDose, refresh } = useAdherence('patient_eleanor_vance');
  const { speak, isSpeaking } = useVoiceAnnouncement();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [lastAction, setLastAction] = useState<{ doseId: string; medName: string } | null>(null);
  const [undoTimer, setUndoTimer] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/appointments?patientId=patient_eleanor_vance')
      .then((res) => res.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch((err) => console.error('Failed to load appointments:', err));
  }, []);

  const handleMarkTaken = async (slot: any) => {
    speak(`Good job Eleanor. You have taken your ${slot.medicationName}.`);
    setLastAction({ doseId: slot.doseId, medName: slot.medicationName });

    if (undoTimer) clearTimeout(undoTimer);
    const timer = window.setTimeout(() => setLastAction(null), 10000);
    setUndoTimer(timer);

    await confirmDose(slot, 'ADMINISTERED', 'Marked taken via Senior Mode');
  };

  const handleSnooze = async (slot: any) => {
    speak(`Reminder for ${slot.medicationName} snoozed for 30 minutes.`);
    await confirmDose(slot, 'SNOOZED', 'Snoozed for 30 minutes');
  };

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

        {/* Accessibility Toolbar Component */}
        <AccessibilityToolbar
          highContrast={highContrast}
          onToggleHighContrast={() => setHighContrast(!highContrast)}
          largeFont={largeFont}
          onToggleLargeFont={() => setLargeFont(!largeFont)}
        />
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Welcome Header */}
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

        {/* 10-Second Undo Notification */}
        {lastAction && (
          <div className="mb-6 bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-bounce">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-emerald-400" />
              <span className="font-bold text-lg">Marked {lastAction.medName} as taken</span>
            </div>
            <button
              onClick={() => {
                setLastAction(null);
                refresh();
              }}
              className="px-4 py-2 bg-yellow-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 hover:bg-yellow-300"
            >
              <Undo2 className="w-5 h-5" />
              Undo
            </button>
          </div>
        )}

        {/* HERO CARD: Modular MedicationCard Component */}
        {nextDueSlot && (
          <div className="mb-10">
            <MedicationCard
              slot={nextDueSlot}
              onTaken={handleMarkTaken}
              onSnooze={handleSnooze}
              onSpeak={speak}
              isSpeaking={isSpeaking}
            />
          </div>
        )}

        {/* Today's Schedule Timeline */}
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

        {/* Emergency Assistance */}
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
