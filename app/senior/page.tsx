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
  Undo2, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  UserCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAdherence } from '@/hooks/useAdherence';
import { useVoiceAnnouncement } from '@/hooks/useVoiceAnnouncement';
import { MedicationCard } from '@/components/senior/MedicationCard';
import { AccessibilityToolbar } from '@/components/shared/AccessibilityToolbar';
import { Appointment } from '@/types';

export default function SeniorModePage() {
  const { schedule, nextDueSlot, takenCount, totalCount, confirmDose, refresh, loading } = useAdherence('patient_savita_sharma');
  const { speak, isSpeaking, selectedVoiceName } = useVoiceAnnouncement();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('HI');
  const [lastAction, setLastAction] = useState<{ doseId: string; medName: string } | null>(null);
  const [undoTimer, setUndoTimer] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/appointments?patientId=patient_savita_sharma')
      .then((res) => res.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch((err) => console.error('Failed to load appointments:', err));
  }, []);

  const handleMarkTaken = async (slot: any) => {
    const praiseText = language === 'HI'
      ? `शाबाश सविता जी! आपने अपनी ${slot.medicationName} दवाई ले ली है।`
      : `Good job Savita ji! You have taken your ${slot.medicationName}.`;
    
    speak(praiseText, { lang: language === 'HI' ? 'hi-IN' : 'en-IN' });
    setLastAction({ doseId: slot.doseId, medName: slot.medicationName });

    if (undoTimer) clearTimeout(undoTimer);
    const timer = window.setTimeout(() => setLastAction(null), 10000);
    setUndoTimer(timer);

    await confirmDose(slot, 'ADMINISTERED', 'Marked taken via Senior Mode');
  };

  const handleSnooze = async (slot: any) => {
    const snoozeText = language === 'HI'
      ? `सविता जी, ${slot.medicationName} की याददिहानी ३० मिनट के लिए आगे बढ़ा दी गई है।`
      : `Reminder for ${slot.medicationName} snoozed for 30 minutes.`;
    
    speak(snoozeText, { lang: language === 'HI' ? 'hi-IN' : 'en-IN' });
    await confirmDose(slot, 'SNOOZED', 'Snoozed for 30 minutes');
  };

  const todayFormatted = new Date().toLocaleDateString(language === 'HI' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        highContrast 
          ? 'bg-black text-yellow-300' 
          : 'bg-gradient-to-b from-amber-50/40 via-white to-slate-50 text-slate-900'
      } ${largeFont ? 'text-xl' : 'text-base'}`}
    >
      {/* Top Accessibility Bar */}
      <nav
        aria-label="Accessibility & Persona Controls"
        className={`px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-md ${
          highContrast ? 'bg-zinc-950 border-b-4 border-yellow-400' : 'bg-slate-900 text-white'
        }`}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white hover:text-amber-300 font-bold min-h-[48px] px-3.5 rounded-xl hover:bg-slate-800 transition-all focus:ring-4 focus:ring-white outline-none"
        >
          <ArrowLeft className="w-6 h-6 text-amber-400" />
          <span className="text-base md:text-lg">{language === 'HI' ? 'मुख्य पृष्ठ (Exit)' : 'Exit Senior Mode'}</span>
        </Link>

        {/* Accessibility Toolbar Component */}
        <AccessibilityToolbar
          highContrast={highContrast}
          onToggleHighContrast={() => setHighContrast(!highContrast)}
          largeFont={largeFont}
          onToggleLargeFont={() => setLargeFont(!largeFont)}
          language={language}
          onToggleLanguage={() => setLanguage(language === 'HI' ? 'EN' : 'HI')}
        />
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Welcome Header */}
        <header className="mb-8 mt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-800 font-extrabold text-sm md:text-base uppercase tracking-wider mb-1 bg-amber-100/80 px-3.5 py-1 rounded-full border border-amber-200">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{todayFormatted}</span>
              </div>
              <h1 className={`text-4xl md:text-6xl font-black tracking-tight mt-1 ${
                highContrast ? 'text-yellow-300' : 'text-slate-950'
              }`}>
                {language === 'HI' ? 'नमस्ते, सविता जी 🙏' : 'Hello, Savita ji'}
              </h1>
              <p className={`text-lg md:text-xl font-medium mt-1 ${
                highContrast ? 'text-yellow-200' : 'text-slate-600'
              }`}>
                {language === 'HI' 
                  ? 'आपकी सेहत हमारी प्राथमिकता है। आइए आज की दवाइयाँ समय पर लें।' 
                  : 'Your health and well-being come first. Here are your routines for today.'}
              </p>
            </div>

            {/* Doses Progress Tracker */}
            <div className={`rounded-3xl px-6 py-4 flex items-center gap-4 border-2 shadow-sm ${
              highContrast 
                ? 'bg-zinc-950 border-yellow-400 text-yellow-300' 
                : 'bg-white border-blue-200 text-slate-900'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {takenCount}/{totalCount}
              </div>
              <div>
                <div className="font-black text-lg md:text-xl">
                  {language === 'HI' ? 'आज की दवाइयाँ' : 'Doses Taken Today'}
                </div>
                <div className="text-sm md:text-base font-bold text-emerald-700">
                  {takenCount === totalCount && totalCount > 0
                    ? '🎉 आज की सभी दवाइयाँ पूरी!'
                    : `${totalCount - takenCount} दवाई बाकी है (${totalCount - takenCount} remaining)`}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 10-Second Undo Notification */}
        {lastAction && (
          <div className="mb-6 bg-slate-950 text-white p-4 md:p-5 rounded-2xl flex items-center justify-between shadow-2xl border-2 border-emerald-400 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <Check className="w-7 h-7 text-emerald-400 stroke-[3]" />
              <span className="font-bold text-lg md:text-xl">
                {language === 'HI'
                  ? `${lastAction.medName} ले ली गई दर्ज किया गया!`
                  : `Marked ${lastAction.medName} as taken`}
              </span>
            </div>
            <button
              onClick={() => {
                setLastAction(null);
                refresh();
              }}
              className="px-4 py-2.5 bg-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-2 hover:bg-amber-300 active:scale-95 transition-all"
            >
              <Undo2 className="w-5 h-5" />
              <span>{language === 'HI' ? 'वापस लें (Undo)' : 'Undo'}</span>
            </button>
          </div>
        )}

        {/* HERO CARD: Current / Next Due Medication */}
        {nextDueSlot ? (
          <div className="mb-10">
            <MedicationCard
              slot={nextDueSlot}
              onTaken={handleMarkTaken}
              onSnooze={handleSnooze}
              onSpeak={speak}
              isSpeaking={isSpeaking}
              language={language}
              highContrast={highContrast}
            />
          </div>
        ) : (
          /* All Medications Taken Celebration Card */
          <div className={`mb-10 rounded-3xl p-8 md:p-12 border-4 text-center shadow-xl ${
            highContrast
              ? 'bg-black border-yellow-400 text-yellow-300'
              : 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-emerald-500/10'
          }`}>
            <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
              <Check className="w-12 h-12 stroke-[3]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              {language === 'HI' ? '🎉 शाबाश सविता जी!' : '🎉 Excellent, Savita ji!'}
            </h2>
            <p className="text-xl md:text-2xl font-bold mt-3 max-w-xl mx-auto">
              {language === 'HI'
                ? 'आज के सभी निर्धारित समय की दवाइयाँ सफलतापूर्वक पूरी हो चुकी हैं। स्वस्थ रहें और आराम करें!'
                : 'All scheduled medications for today have been taken on time. Stay hydrated and rest well!'}
            </p>
            <button
              onClick={() => refresh()}
              className="mt-6 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg inline-flex items-center gap-2 active:scale-95 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>{language === 'HI' ? 'शेड्यूल रीफ़्रेश करें' : 'Refresh Schedule'}</span>
            </button>
          </div>
        )}

        {/* FULL TODAY'S TIMELINE LIST */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl md:text-3xl font-black ${highContrast ? 'text-yellow-300' : 'text-slate-900'}`}>
              {language === 'HI' ? '📋 आज का पूरा शेड्यूल' : "📋 Today's Full Schedule"}
            </h2>
            <span className="text-sm font-bold text-slate-500">
              {schedule.length} {language === 'HI' ? 'दवाइयाँ' : 'Medications'}
            </span>
          </div>

          <div className="space-y-4">
            {schedule.map((item) => {
              const isDone = item.status === 'ADMINISTERED';
              const isOverdue = item.status === 'OVERDUE' || item.status === 'MISSED';

              return (
                <div
                  key={item.doseId}
                  className={`rounded-2xl p-5 border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    highContrast
                      ? 'bg-zinc-950 border-yellow-400 text-yellow-300'
                      : isDone
                      ? 'bg-slate-50 border-slate-200 opacity-80'
                      : isOverdue
                      ? 'bg-amber-50 border-amber-300 shadow-sm'
                      : 'bg-white border-blue-200 shadow-sm hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isOverdue
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isDone ? <Check className="w-6 h-6 stroke-[3]" /> : <Clock className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xl text-slate-900">
                          {item.medicationName}
                        </span>
                        <span className="text-sm font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700">
                          {item.dosage}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 mt-0.5">
                        {item.instructions}
                      </p>
                      <div className="text-xs font-bold text-blue-800 mt-1 flex items-center gap-2">
                        <span>⏰ {item.scheduledTimeStr} {parseInt(item.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
                        <span>•</span>
                        <span>{item.foodRelation === 'WITH_MEAL' ? '🍽️ With Food' : item.foodRelation === 'BEFORE_MEAL' ? '🌅 Empty Stomach' : '🥛 With Water'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {isDone ? (
                      <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>{language === 'HI' ? 'ली जा चुकी है' : 'Completed'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkTaken(item)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>{language === 'HI' ? 'दवाई ली' : 'Mark Taken'}</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        speak(
                          language === 'HI'
                            ? `${item.medicationName}, ${item.dosage}। समय ${item.scheduledTimeStr}। ${item.instructions}`
                            : `${item.medicationName}, ${item.dosage}. Scheduled at ${item.scheduledTimeStr}. ${item.instructions}`,
                          { lang: language === 'HI' ? 'hi-IN' : 'en-IN' }
                        )
                      }
                      className="p-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 active:scale-95 transition-all"
                      title="Listen"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* UPCOMING DOCTOR APPOINTMENTS CARD */}
        {appointments.length > 0 && (
          <section className="mb-10">
            <h2 className={`text-2xl md:text-3xl font-black mb-4 ${highContrast ? 'text-yellow-300' : 'text-slate-900'}`}>
              {language === 'HI' ? '🩺 आगामी डॉक्टर विज़िट' : '🩺 Upcoming Doctor Visits'}
            </h2>

            <div className="space-y-4">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className={`rounded-3xl p-6 border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm ${
                    highContrast
                      ? 'bg-zinc-950 border-yellow-400 text-yellow-300'
                      : 'bg-white border-indigo-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                      {appt.specialty}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      {appt.doctorName}
                    </h3>
                    <div className="text-base font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{appt.clinicHospital}</span>
                    </div>
                    <div className="text-sm font-bold text-indigo-700 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(appt.appointmentTime).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {appt.notes && (
                      <p className="text-sm bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-indigo-950 mt-3">
                        📌 {appt.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex md:flex-col gap-3">
                    <a
                      href={`tel:${appt.contactNumber}`}
                      className="flex-1 md:flex-initial py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all min-h-[52px]"
                    >
                      <Phone className="w-5 h-5" />
                      <span>{language === 'HI' ? 'अस्पताल कॉल करें' : 'Call Clinic'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EMERGENCY / CARETAKER DIRECT ACCESS */}
        <section className={`rounded-3xl p-6 md:p-8 border-2 shadow-sm ${
          highContrast
            ? 'bg-zinc-950 border-yellow-400 text-yellow-300'
            : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                {language === 'HI' ? 'परिवार एवं केयरटेकर सहायता' : 'Caretaker & Family Direct Call'}
              </h3>
              <p className="text-sm font-medium text-slate-700">
                {language === 'HI' ? 'किसी भी ज़रूरत या सवाल के लिए १-क्लिक में कॉल करें' : 'One-tap call to your designated caregivers'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <a
              href="tel:+919810123456"
              className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all min-h-[68px]"
            >
              <Phone className="w-6 h-6 stroke-[2.5]" />
              <span>{language === 'HI' ? 'राहुल को कॉल करें (बेटा)' : 'Call Rahul (Son)'}</span>
            </a>

            <a
              href="tel:+919820234567"
              className="py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95 transition-all min-h-[68px]"
            >
              <Phone className="w-6 h-6 stroke-[2.5]" />
              <span>{language === 'HI' ? 'प्रिया को कॉल करें (बेटी)' : 'Call Priya (Daughter)'}</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
