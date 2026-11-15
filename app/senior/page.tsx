'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Clock, 
  Calendar, 
  Phone, 
  ArrowLeft, 
  Undo2, 
  Volume2, 
  CheckCircle2, 
  RefreshCw,
  Sun,
  Languages,
  Stethoscope,
  Loader2
} from 'lucide-react';
import { useAdherence } from '@/hooks/useAdherence';
import { useVoiceAnnouncement } from '@/hooks/useVoiceAnnouncement';
import { MedicationCard } from '@/components/senior/MedicationCard';
import { PillGraphic } from '@/components/senior/PillGraphic';
import { Appointment } from '@/types';

export default function SeniorModePage() {
  const { schedule, nextDueSlot, takenCount, totalCount, confirmDose, refresh } = useAdherence('patient_savita_sharma');
  const { speak, isSpeaking, isLoadingVoice } = useVoiceAnnouncement();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [highContrast, setHighContrast] = useState(false);
  // Default language is English per user requirements
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [lastAction, setLastAction] = useState<{ doseId: string; medName: string } | null>(null);
  const [undoTimer, setUndoTimer] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/appointments?patientId=patient_savita_sharma')
      .then((res) => res.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch((err) => console.error('Failed to load appointments:', err));
  }, []);

  const handleMarkTaken = async (slot: any) => {
    const visual = slot.visualIdentity;
    // Sarvam voice speaks natural Hindi by default
    const praiseVoiceText = `शाबाश सविता जी! आपने अपनी दवाई ले ली है।`;
    speak(praiseVoiceText, { lang: 'hi-IN' });

    const displayedName = language === 'HI' 
      ? (visual?.purposeLabelHindi || slot.medicationName)
      : (visual?.purposeLabelEnglish || slot.medicationName);

    setLastAction({ doseId: slot.doseId, medName: displayedName });

    if (undoTimer) clearTimeout(undoTimer);
    const timer = window.setTimeout(() => setLastAction(null), 10000);
    setUndoTimer(timer);

    await confirmDose(slot, 'ADMINISTERED', 'Marked taken via Senior Mode');
  };

  const handleSnooze = async (slot: any) => {
    const snoozeVoiceText = `सविता जी, आपकी दवाई की याददिहानी ३० मिनट के लिए आगे बढ़ा दी गई है।`;
    speak(snoozeVoiceText, { lang: 'hi-IN' });
    await confirmDose(slot, 'SNOOZED', 'Snoozed for 30 minutes');
  };

  const todayFormatted = new Date().toLocaleDateString(language === 'HI' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Clean Navigation Bar */}
      <nav
        aria-label="Accessibility Navigation"
        className={`px-4 md:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-40 border-b shadow-sm ${
          highContrast ? 'bg-zinc-950 border-yellow-400' : 'bg-white border-slate-200'
        }`}
      >
        <Link
          href="/"
          className={`inline-flex items-center gap-1.5 font-bold text-xs md:text-sm min-h-[38px] px-3 rounded-lg border transition-all ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-500'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'HI' ? 'मुख्य पृष्ठ' : 'Exit to Home'}</span>
        </Link>

        {/* Compact Controls: Language Switcher + High Contrast */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'HI' ? 'EN' : 'HI')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm border flex items-center gap-1.5 min-h-[38px] transition-all ${
              language === 'HI'
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
            aria-label="Toggle language"
          >
            <Languages className="w-4 h-4" />
            <span>{language === 'HI' ? 'भाषा: हिंदी' : 'Language: English'}</span>
          </button>

          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm border flex items-center gap-1.5 min-h-[38px] transition-all ${
              highContrast
                ? 'bg-yellow-400 text-black border-black font-black'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
            aria-pressed={highContrast}
          >
            <Sun className="w-4 h-4" />
            <span>{highContrast ? 'High Contrast: ON' : 'High Contrast: OFF'}</span>
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-4 md:p-6">
        {/* Compact, Refined Header */}
        <header className="my-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                highContrast ? 'text-yellow-400' : 'text-teal-700'
              }`}>
                {todayFormatted} • New Delhi
              </span>
              <h1 className={`text-2xl md:text-3xl font-black tracking-tight mt-0.5 ${
                highContrast ? 'text-yellow-300' : 'text-slate-900'
              }`}>
                {language === 'HI' ? 'नमस्ते, सविता जी' : 'Hello, Savita ji'}
              </h1>
              <p className={`text-xs md:text-sm font-medium mt-0.5 ${
                highContrast ? 'text-yellow-200' : 'text-slate-500'
              }`}>
                {language === 'HI'
                  ? 'अपनी गोली की पहचान चित्र और रंग से करें।'
                  : 'Identify each medication by its pill shape, color, and routine.'}
              </p>
            </div>

            {/* Doses Completed Counter */}
            <div className={`rounded-xl px-4 py-2.5 flex items-center gap-3 border shadow-sm ${
              highContrast 
                ? 'bg-zinc-950 border-yellow-400 text-yellow-300' 
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-teal-700 text-white font-black text-lg flex items-center justify-center">
                {takenCount}/{totalCount}
              </div>
              <div>
                <div className="font-bold text-xs uppercase tracking-wide text-slate-500">
                  {language === 'HI' ? 'आज की दवाइयाँ' : 'Today&apos;s Doses'}
                </div>
                <div className="text-xs font-bold text-teal-800">
                  {takenCount === totalCount && totalCount > 0
                    ? (language === 'HI' ? 'सभी दवाइयाँ पूर्ण!' : 'All Doses Taken!')
                    : (language === 'HI' ? `${totalCount - takenCount} बाकी है` : `${totalCount - takenCount} Remaining`)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 10-Second Undo Alert Bar */}
        {lastAction && (
          <div className="mb-4 bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between shadow-lg border border-emerald-400 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
              <span className="font-bold text-sm">
                {language === 'HI'
                  ? `${lastAction.medName} ले ली गई दर्ज हुआ`
                  : `Marked ${lastAction.medName} as taken`}
              </span>
            </div>
            <button
              onClick={() => {
                setLastAction(null);
                refresh();
              }}
              className="px-3 py-1 bg-yellow-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 hover:bg-yellow-300"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{language === 'HI' ? 'वापस लें' : 'Undo'}</span>
            </button>
          </div>
        )}

        {/* HERO CARD: Active / Next Due Medicine */}
        {nextDueSlot ? (
          <div className="mb-6">
            <MedicationCard
              slot={nextDueSlot}
              onTaken={handleMarkTaken}
              onSnooze={handleSnooze}
              onSpeak={speak}
              isSpeaking={isSpeaking}
              isLoadingVoice={isLoadingVoice}
              language={language}
              highContrast={highContrast}
            />
          </div>
        ) : (
          /* Celebratory All-Done State */
          <div className={`mb-6 rounded-2xl p-6 text-center border shadow-sm ${
            highContrast
              ? 'bg-black border-yellow-400 text-yellow-300'
              : 'bg-white border-teal-500 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              {language === 'HI' ? 'शाबाश सविता जी!' : 'All Caught Up, Savita ji!'}
            </h2>
            <p className="text-xs md:text-sm font-medium mt-1 text-slate-600 max-w-md mx-auto">
              {language === 'HI'
                ? 'आज की सभी निर्धारित दवाइयाँ पूरी हो चुकी हैं।'
                : 'All scheduled medications for today have been taken on time.'}
            </p>
            <button
              onClick={() => refresh()}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs inline-flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'HI' ? 'रीफ़्रेश करें' : 'Refresh Schedule'}</span>
            </button>
          </div>
        )}

        {/* COMPACT TODAY'S TIMELINE LIST */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-base md:text-lg font-black ${highContrast ? 'text-yellow-300' : 'text-slate-900'}`}>
              {language === 'HI' ? 'आज की दवाइयाँ' : 'Today&apos;s Medication Routine'}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {schedule.length} {language === 'HI' ? 'गोली' : 'Doses'}
            </span>
          </div>

          <div className="space-y-3">
            {schedule.map((item) => {
              const isDone = item.status === 'ADMINISTERED';
              const visual = item.visualIdentity || {
                shape: 'ROUND_TABLET' as const,
                color: '#FFFFFF',
                colorLabelEnglish: 'White Round Tablet',
                colorLabelHindi: 'सफ़ेद गोल गोली',
                purposeLabelEnglish: 'Routine Dose',
                purposeLabelHindi: 'दवाई',
                instructionsEnglish: item.instructions,
                instructionsHindi: item.instructions,
                mealTimingEnglish: 'Take with water',
                mealTimingHindi: 'पानी के साथ लें',
                voiceHindiScript: `सविता जी, यह आपकी दवाई ${item.medicationName} है।`,
                voiceEnglishScript: `Savita ji, this is your medication ${item.medicationName}.`,
              };

              return (
                <div
                  key={item.doseId}
                  className={`rounded-xl p-3.5 border flex items-center justify-between gap-3 transition-all ${
                    highContrast
                      ? 'bg-zinc-950 border-yellow-400 text-yellow-300'
                      : isDone
                      ? 'bg-white border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-teal-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Compact Pill Thumbnail */}
                    <div className="shrink-0">
                      <PillGraphic
                        shape={visual.shape}
                        color={visual.color}
                        secondaryColor={visual.secondaryColor}
                        size="sm"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm md:text-base text-slate-900 truncate">
                          {language === 'HI' ? visual.purposeLabelHindi : item.medicationName}
                        </span>
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {item.dosage}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {language === 'HI' ? visual.colorLabelHindi : visual.colorLabelEnglish}
                      </div>

                      <div className="text-[11px] font-bold text-teal-800 mt-1 flex items-center gap-2">
                        <span>⏰ {item.scheduledTimeStr} {parseInt(item.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
                        <span>•</span>
                        <span>{language === 'HI' ? visual.mealTimingHindi : visual.mealTimingEnglish}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isDone ? (
                      <span className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs flex items-center gap-1 border border-teal-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>{language === 'HI' ? 'पूर्ण' : 'Taken'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkTaken(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{language === 'HI' ? 'दवाई ली' : 'Mark Taken'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => speak(visual.voiceHindiScript, { lang: 'hi-IN' })}
                      disabled={isLoadingVoice}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
                      title="Listen with Sarvam AI"
                      aria-label="Listen aloud with Sarvam AI"
                    >
                      {isLoadingVoice ? <Loader2 className="w-4 h-4 animate-spin text-teal-700" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* COMPACT DOCTOR APPOINTMENTS CARD */}
        {appointments.length > 0 && (
          <section className="mb-6">
            <h2 className={`text-base md:text-lg font-black mb-3 ${highContrast ? 'text-yellow-300' : 'text-slate-900'}`}>
              {language === 'HI' ? 'डॉक्टर अपॉइंटमेंट' : 'Doctor Visits'}
            </h2>

            <div className="space-y-3">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className={`rounded-xl p-4 border flex items-center justify-between gap-4 shadow-sm ${
                    highContrast
                      ? 'bg-zinc-950 border-yellow-400 text-yellow-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {appt.specialty}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-teal-700" />
                      <span>{appt.doctorName}</span>
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {appt.clinicHospital}
                    </div>
                    <div className="text-xs font-bold text-teal-800 mt-1 flex items-center gap-1">
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
                    className="py-2 px-3.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{language === 'HI' ? 'कॉल करें' : 'Call Clinic'}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 1-TAP CAREGIVER DIRECT CALL CARDS */}
        <section className={`rounded-xl p-4 border shadow-sm ${
          highContrast ? 'bg-zinc-950 border-yellow-400 text-yellow-300' : 'bg-white border-slate-200'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
            {language === 'HI' ? 'परिवार सहायता' : 'Caregiver Direct Access'}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:+919810123456"
              className="py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{language === 'HI' ? 'राहुल (बेटा)' : 'Call Rahul (Son)'}</span>
            </a>

            <a
              href="tel:+919820234567"
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{language === 'HI' ? 'प्रिया (बेटी)' : 'Call Priya (Daughter)'}</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
