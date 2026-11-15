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
  Eye,
  Languages,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useAdherence } from '@/hooks/useAdherence';
import { useVoiceAnnouncement } from '@/hooks/useVoiceAnnouncement';
import { MedicationCard } from '@/components/senior/MedicationCard';
import { PillGraphic } from '@/components/senior/PillGraphic';
import { Appointment } from '@/types';

export default function SeniorModePage() {
  const { schedule, nextDueSlot, takenCount, totalCount, confirmDose, refresh } = useAdherence('patient_savita_sharma');
  const { speak, isSpeaking, selectedVoiceName, voiceEngine } = useVoiceAnnouncement();

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
      ? `शाबाश सविता जी! आपने अपनी ${slot.visualIdentity?.purposeLabelHindi || slot.medicationName} ले ली है।`
      : `Good job Savita ji! You have taken your ${slot.medicationName}.`;
    
    speak(praiseText, { lang: language === 'HI' ? 'hi-IN' : 'en-IN' });
    setLastAction({ doseId: slot.doseId, medName: slot.visualIdentity?.purposeLabelHindi || slot.medicationName });

    if (undoTimer) clearTimeout(undoTimer);
    const timer = window.setTimeout(() => setLastAction(null), 10000);
    setUndoTimer(timer);

    await confirmDose(slot, 'ADMINISTERED', 'Marked taken via Senior Mode');
  };

  const handleSnooze = async (slot: any) => {
    const snoozeText = language === 'HI'
      ? `सविता जी, दवाई की याददिहानी ३० मिनट के लिए आगे बढ़ा दी गई है।`
      : `Reminder for ${slot.medicationName} snoozed for 30 minutes.`;
    
    speak(snoozeText, { lang: language === 'HI' ? 'hi-IN' : 'en-IN' });
    await confirmDose(slot, 'SNOOZED', 'Snoozed for 30 minutes');
  };

  const todayFormatted = new Date().toLocaleDateString(language === 'HI' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main
      className={`min-h-screen pb-24 transition-colors duration-200 ${
        highContrast 
          ? 'bg-black text-yellow-300' 
          : 'bg-[#FAF8F5] text-slate-900'
      } ${largeFont ? 'text-xl' : 'text-base'}`}
    >
      {/* Top Accessible Navigation Bar */}
      <nav
        aria-label="Accessibility Navigation"
        className={`px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 border-b-2 shadow-sm ${
          highContrast ? 'bg-zinc-950 border-yellow-400' : 'bg-white border-slate-200'
        }`}
      >
        <Link
          href="/"
          className={`inline-flex items-center gap-2 font-black min-h-[48px] px-4 rounded-xl border-2 transition-all focus:ring-4 outline-none ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-500'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
          }`}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>{language === 'HI' ? 'मुख्य पृष्ठ (Exit)' : 'Exit Senior Mode'}</span>
        </Link>

        {/* Accessibility Buttons (Language, Contrast, Text Size) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'HI' ? 'EN' : 'HI')}
            className={`px-4 py-2 rounded-xl font-black text-sm md:text-base border-2 flex items-center gap-2 min-h-[48px] outline-none transition-all ${
              language === 'HI'
                ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}
            aria-label="Toggle language"
          >
            <Languages className="w-5 h-5" />
            <span>{language === 'HI' ? 'भाषा: हिंदी' : 'Language: English'}</span>
          </button>

          {/* High Contrast AAA Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-4 py-2 rounded-xl font-black text-sm md:text-base border-2 flex items-center gap-2 min-h-[48px] outline-none transition-all ${
              highContrast
                ? 'bg-yellow-400 text-black border-black shadow-sm'
                : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}
            aria-pressed={highContrast}
          >
            <Sun className="w-5 h-5" />
            <span>{highContrast ? 'Contrast: High AAA' : 'Contrast: Standard'}</span>
          </button>

          {/* Large Font Size Toggle */}
          <button
            onClick={() => setLargeFont(!largeFont)}
            className={`px-4 py-2 rounded-xl font-black text-sm md:text-base border-2 flex items-center gap-2 min-h-[48px] outline-none transition-all ${
              largeFont
                ? 'bg-yellow-400 text-black border-black shadow-sm'
                : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}
            aria-pressed={largeFont}
          >
            <Eye className="w-5 h-5" />
            <span>{largeFont ? 'Text: 28px (XL)' : 'Text: 20px'}</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Dignified Header */}
        <header className="my-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className={`text-xs md:text-sm font-extrabold uppercase tracking-widest ${
                highContrast ? 'text-yellow-400' : 'text-teal-800'
              }`}>
                {todayFormatted} • New Delhi
              </span>
              <h1 className={`text-4xl md:text-6xl font-black tracking-tight mt-1 ${
                highContrast ? 'text-yellow-300' : 'text-slate-950'
              }`}>
                {language === 'HI' ? 'नमस्ते, सविता जी' : 'Hello, Savita ji'}
              </h1>
              <p className={`text-lg md:text-xl font-medium mt-1 ${
                highContrast ? 'text-yellow-200' : 'text-slate-600'
              }`}>
                {language === 'HI'
                  ? 'अपनी गोली की पहचान चित्र और रंग से करें।'
                  : 'Identify each medication by its shape, color, and routine.'}
              </p>
            </div>

            {/* Doses Completed Counter */}
            <div className={`rounded-2xl px-6 py-4 flex items-center gap-4 border-2 shadow-sm ${
              highContrast 
                ? 'bg-zinc-950 border-yellow-400 text-yellow-300' 
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {takenCount}/{totalCount}
              </div>
              <div>
                <div className="font-black text-lg md:text-xl">
                  {language === 'HI' ? 'आज की दवाइयाँ' : 'Today&apos;s Doses'}
                </div>
                <div className="text-sm md:text-base font-bold text-teal-800">
                  {takenCount === totalCount && totalCount > 0
                    ? 'आज की सभी दवाइयाँ पूरी!'
                    : `${totalCount - takenCount} दवाई बाकी है`}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 10-Second Undo Alert Bar */}
        {lastAction && (
          <div className="mb-6 bg-slate-900 text-white p-4 md:p-5 rounded-2xl flex items-center justify-between shadow-2xl border-2 border-emerald-400 animate-in fade-in">
            <div className="flex items-center gap-3">
              <Check className="w-7 h-7 text-emerald-400 stroke-[3]" />
              <span className="font-bold text-lg md:text-xl">
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
              className="px-4 py-2 bg-yellow-400 text-slate-950 font-black rounded-xl flex items-center gap-2 hover:bg-yellow-300 transition-all"
            >
              <Undo2 className="w-5 h-5" />
              <span>{language === 'HI' ? 'वापस लें (Undo)' : 'Undo'}</span>
            </button>
          </div>
        )}

        {/* HERO CARD: Primary Current Medicine with Visual Pill Shape */}
        {nextDueSlot ? (
          <div className="mb-10">
            <MedicationCard
              slot={nextDueSlot}
              onTaken={handleMarkTaken}
              onSnooze={handleSnooze}
              onSpeak={speak}
              isSpeaking={isSpeaking}
              voiceEngine={voiceEngine}
              language={language}
              highContrast={highContrast}
            />
          </div>
        ) : (
          /* Celebratory All-Done State */
          <div className={`mb-10 rounded-3xl p-8 md:p-12 border-4 text-center shadow-xl ${
            highContrast
              ? 'bg-black border-yellow-400 text-yellow-300'
              : 'bg-white border-teal-600 text-slate-950 shadow-teal-500/10'
          }`}>
            <div className="w-20 h-20 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-600/30">
              <Check className="w-12 h-12 stroke-[3]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              {language === 'HI' ? 'शाबाश सविता जी!' : 'All Caught Up, Savita ji!'}
            </h2>
            <p className="text-xl md:text-2xl font-bold mt-3 max-w-xl mx-auto text-slate-700">
              {language === 'HI'
                ? 'आज के सभी निर्धारित समय की दवाइयाँ सफलतापूर्वक पूरी हो चुकी हैं।'
                : 'All scheduled medications for today have been completed.'}
            </p>
            <button
              onClick={() => refresh()}
              className="mt-6 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-lg inline-flex items-center gap-2 active:scale-95 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>{language === 'HI' ? 'शेड्यूल रीफ़्रेश करें' : 'Refresh Schedule'}</span>
            </button>
          </div>
        )}

        {/* TODAY'S MEDICINE BOX: VISUAL IDENTIFICATION LIST */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl md:text-3xl font-black ${highContrast ? 'text-yellow-300' : 'text-slate-900'}`}>
              {language === 'HI' ? 'आज की सभी दवाइयाँ (चित्र सहित)' : 'Today&apos;s Medications (Visual Pill Gallery)'}
            </h2>
            <span className="text-sm font-bold text-slate-500">
              {schedule.length} {language === 'HI' ? 'दवाइयाँ' : 'Doses'}
            </span>
          </div>

          <div className="space-y-4">
            {schedule.map((item) => {
              const isDone = item.status === 'ADMINISTERED';
              const visual = item.visualIdentity || {
                shape: 'ROUND_TABLET' as const,
                color: '#FFFFFF',
                colorLabel: 'सफ़ेद गोली',
                purposeLabelHindi: 'दवाई',
                purposeLabelEnglish: 'Dose',
                mealTimingHindi: 'पानी के साथ लें',
              };

              return (
                <div
                  key={item.doseId}
                  className={`rounded-2xl p-5 border-2 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all ${
                    highContrast
                      ? 'bg-zinc-950 border-yellow-400 text-yellow-300'
                      : isDone
                      ? 'bg-white border-slate-200 opacity-70'
                      : 'bg-white border-slate-300 shadow-sm hover:border-teal-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Visual Pill Thumbnail */}
                    <div className="shrink-0">
                      <PillGraphic
                        shape={visual.shape}
                        color={visual.color}
                        secondaryColor={visual.secondaryColor}
                        size="sm"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-xl text-slate-950">
                          {language === 'HI' ? visual.purposeLabelHindi : item.medicationName}
                        </span>
                        <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">
                          {item.dosage}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          ({visual.colorLabel})
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-600 mt-1">
                        {item.instructions}
                      </p>

                      <div className="text-xs font-bold text-teal-800 mt-1.5 flex items-center gap-2">
                        <span>⏰ {item.scheduledTimeStr} {parseInt(item.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
                        <span>•</span>
                        <span>{visual.mealTimingHindi}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {isDone ? (
                      <span className="px-4 py-2 rounded-xl bg-teal-50 text-teal-800 font-black text-sm flex items-center gap-1.5 border border-teal-200">
                        <CheckCircle2 className="w-5 h-5 text-teal-700" />
                        <span>{language === 'HI' ? 'पूर्ण' : 'Completed'}</span>
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
                            ? `यह आपकी ${visual.purposeLabelHindi} है। ${visual.colorLabel}। ${item.instructions}`
                            : `${item.medicationName}, ${item.dosage}. ${item.instructions}`,
                          { lang: language === 'HI' ? 'hi-IN' : 'en-IN' }
                        )
                      }
                      className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
                      title="Listen with Sarvam AI"
                      aria-label="Listen aloud"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CLINIC & DOCTOR VISIT */}
        {appointments.length > 0 && (
          <section className="mb-10">
            <h2 className={`text-2xl md:text-3xl font-black mb-4 ${highContrast ? 'text-yellow-300' : 'text-slate-900'}`}>
              {language === 'HI' ? 'डॉक्टर अपॉइंटमेंट (Doctor Visit)' : 'Doctor Appointments'}
            </h2>

            <div className="space-y-4">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className={`rounded-3xl p-6 border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm ${
                    highContrast
                      ? 'bg-zinc-950 border-yellow-400 text-yellow-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-3 py-1 rounded-full">
                      {appt.specialty}
                    </span>
                    <h3 className="text-2xl font-black text-slate-950 mt-2 flex items-center gap-2">
                      <Stethoscope className="w-6 h-6 text-teal-700" />
                      <span>{appt.doctorName}</span>
                    </h3>
                    <div className="text-base font-semibold text-slate-700 mt-1">
                      {appt.clinicHospital}
                    </div>
                    <div className="text-sm font-bold text-teal-800 mt-1 flex items-center gap-1.5">
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
                  </div>

                  <a
                    href={`tel:${appt.contactNumber}`}
                    className="py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-center flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all min-h-[52px]"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{language === 'HI' ? 'अस्पताल को कॉल करें' : 'Call Clinic'}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 1-TAP EMERGENCY / CARETAKER CALL */}
        <section className={`rounded-3xl p-6 md:p-8 border-2 shadow-sm ${
          highContrast
            ? 'bg-zinc-950 border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                {language === 'HI' ? 'केयरटेकर व परिवार को कॉल करें' : 'Caregiver Emergency Call'}
              </h3>
              <p className="text-sm font-medium text-slate-600">
                {language === 'HI' ? 'सहायता के लिए सीधे १-क्लिक में फ़ोन लगाएं' : 'One-tap direct dial to family'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <a
              href="tel:+919810123456"
              className="py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xl flex items-center justify-center gap-3 shadow-md active:scale-95 transition-all min-h-[68px]"
            >
              <Phone className="w-6 h-6 stroke-[2.5]" />
              <span>{language === 'HI' ? 'राहुल को कॉल करें (बेटा)' : 'Call Rahul (Son)'}</span>
            </a>

            <a
              href="tel:+919820234567"
              className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xl flex items-center justify-center gap-3 shadow-md active:scale-95 transition-all min-h-[68px]"
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
