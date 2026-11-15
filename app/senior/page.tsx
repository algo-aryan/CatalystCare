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
  Languages,
  Stethoscope,
  Loader2,
  RotateCcw
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
  // Default language is English
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [lastAction, setLastAction] = useState<{ doseId: string; medName: string } | null>(null);
  const [undoTimer, setUndoTimer] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch('/api/appointments?patientId=patient_savita_sharma')
      .then((res) => res.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch((err) => console.error('Failed to load appointments:', err));
  }, []);

  const handleMarkTaken = async (slot: any) => {
    const visual = slot.visualIdentity;
    const praiseVoiceText = `शाबाश सविता जी! आपने अपनी दवाई ले ली है।`;
    const englishPraise = `Good job Savita ji! You have taken your medication.`;
    
    speak(praiseVoiceText, { lang: 'hi-IN', englishFallbackText: englishPraise });

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
    const englishSnooze = `Reminder for your medication snoozed for 30 minutes.`;
    speak(snoozeVoiceText, { lang: 'hi-IN', englishFallbackText: englishSnooze });
    await confirmDose(slot, 'SNOOZED', 'Snoozed for 30 minutes');
  };

  const handleResetSchedule = async () => {
    setResetting(true);
    try {
      await fetch('/api/doses/reset', { method: 'POST' });
      await refresh();
    } catch (e) {
      console.error('Reset error:', e);
    } finally {
      setResetting(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString(language === 'HI' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen pb-16 bg-slate-50 text-slate-900">
      {/* Top Clean Navigation Bar */}
      <nav
        aria-label="Accessibility Navigation"
        className="px-4 md:px-8 py-3 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bold text-xs md:text-sm min-h-[38px] px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'HI' ? 'मुख्य पृष्ठ' : 'Exit to Home'}</span>
          </Link>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'HI' ? 'EN' : 'HI')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs md:text-sm border flex items-center gap-1.5 min-h-[38px] transition-all ${
              language === 'HI'
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
            aria-label="Toggle language"
          >
            <Languages className="w-4 h-4" />
            <span>{language === 'HI' ? 'भाषा: हिंदी' : 'Language: English'}</span>
          </button>
        </div>
      </nav>

      {/* Main Container: Wide Max Width for Side-by-Side Layout */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Bar */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              {todayFormatted} • New Delhi
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-0.5">
              {language === 'HI' ? 'नमस्ते, सविता जी' : 'Hello, Savita ji'}
            </h1>
            <p className="text-xs md:text-sm font-medium text-slate-500 mt-0.5">
              {language === 'HI'
                ? 'अपनी गोली की पहचान चित्र और रंग से करें।'
                : 'Identify each medication by its pill shape, color, and meal routine.'}
            </p>
          </div>

          {/* Doses Progress Counter & Test Reset Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSchedule}
              disabled={resetting}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-all"
              title="Reset doses to pending to test the flow again"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Doses (Test)'}</span>
            </button>

            <div className="rounded-xl px-4 py-2 bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-teal-700 text-white font-black text-base flex items-center justify-center">
                {takenCount}/{totalCount}
              </div>
              <div>
                <div className="font-bold text-[11px] uppercase tracking-wide text-slate-500">
                  {language === 'HI' ? "आज की दवाइयाँ" : "Today's Doses"}
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
          <div className="mb-6 bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between shadow-lg border border-emerald-400 animate-in fade-in">
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

        {/* SIDE-BY-SIDE RESPONSIVE GRID (Eliminates empty space on corners) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: ACTIVE DOSE HERO + CAREGIVER / CLINIC ACCESS */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Due Dose Card or Celebratory All-Done */}
            {nextDueSlot ? (
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-teal-800 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>{language === 'HI' ? 'अगली निर्धारित खुराक' : 'Next Scheduled Dose'}</span>
                </div>
                <MedicationCard
                  slot={nextDueSlot}
                  onTaken={handleMarkTaken}
                  onSnooze={handleSnooze}
                  onSpeak={speak}
                  isSpeaking={isSpeaking}
                  isLoadingVoice={isLoadingVoice}
                  language={language}
                />
              </div>
            ) : (
              <div className="rounded-2xl p-6 text-center border border-teal-500 bg-white shadow-sm">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  {language === 'HI' ? 'शाबाश सविता जी!' : 'All Caught Up, Savita ji!'}
                </h2>
                <p className="text-xs md:text-sm font-medium mt-1 text-slate-600 max-w-sm mx-auto">
                  {language === 'HI'
                    ? 'आज की सभी निर्धारित दवाइयाँ पूरी हो चुकी हैं।'
                    : 'All scheduled medications for today have been taken on time.'}
                </p>
                <button
                  onClick={handleResetSchedule}
                  className="mt-4 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs inline-flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'HI' ? 'परीक्षण हेतु पुनः शुरू करें' : 'Reset to Test Again'}</span>
                </button>
              </div>
            )}

            {/* Quick Caregiver Emergency Call Card */}
            <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
                {language === 'HI' ? 'परिवार व केयरटेकर संपर्क' : 'Caregiver Direct Access'}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+919810123456"
                  className="py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{language === 'HI' ? 'राहुल (बेटा)' : 'Call Rahul (Son)'}</span>
                </a>

                <a
                  href="tel:+919820234567"
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{language === 'HI' ? 'प्रिया (बेटी)' : 'Call Priya (Daughter)'}</span>
                </a>
              </div>
            </div>

            {/* Doctor Appointment Card */}
            {appointments.length > 0 && (
              <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                  {language === 'HI' ? 'आगामी डॉक्टर अपॉइंटमेंट' : 'Upcoming Doctor Visit'}
                </div>

                {appointments.slice(0, 1).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-teal-700" />
                        <span>{appt.doctorName}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">{appt.clinicHospital}</p>
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
                      className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs flex items-center gap-1 shrink-0 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{language === 'HI' ? 'कॉल' : 'Call'}</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TODAY'S FULL TIMELINE LIST (Side-by-side) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {language === 'HI' ? 'आज की पूरी दिनचर्या' : "Today's Medication Routine"}
                </h2>
                <p className="text-xs text-slate-500">
                  {schedule.length} {language === 'HI' ? 'दवाइयाँ निर्धारित' : 'scheduled doses'}
                </p>
              </div>

              <button
                onClick={handleResetSchedule}
                disabled={resetting}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                title="Reset all doses"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'HI' ? 'रीसेट' : 'Reset'}</span>
              </button>
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
                      isDone
                        ? 'bg-slate-50/60 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-teal-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Pill Illustration Thumbnail */}
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
                          <span>{language === 'HI' ? 'दवाई ली' : 'Take'}</span>
                        </button>
                      )}

                      {/* Pure Voice Button: Speaks Sarvam AI Hindi or English audio without changing dose status */}
                      <button
                        onClick={() => speak(visual.voiceHindiScript, { lang: 'hi-IN', englishFallbackText: visual.voiceEnglishScript })}
                        disabled={isLoadingVoice}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
                        title="Listen with Sarvam AI"
                        aria-label="Listen with Sarvam AI"
                      >
                        {isLoadingVoice ? <Loader2 className="w-4 h-4 animate-spin text-teal-700" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
