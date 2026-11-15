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
  Languages,
  Stethoscope,
  Loader2,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAdherence } from '@/hooks/useAdherence';
import { useVoiceAnnouncement } from '@/hooks/useVoiceAnnouncement';
import { MedicationCard } from '@/components/senior/MedicationCard';
import { PillGraphic } from '@/components/senior/PillGraphic';
import { Appointment } from '@/types';

// 12 Culturally Authentic & Warm Acknowledgment Modes
const PRAISE_MODES = [
  {
    hindi: 'शाबाश सविता जी! आपने बहुत अच्छा किया, दवाई समय पर ले ली।',
    english: 'Well done Savita ji! You took your medication right on time.',
  },
  {
    hindi: 'बहुत खूब सविता जी! अपनी सेहत का ख्याल रखने के लिए धन्यवाद।',
    english: 'Wonderful Savita ji! Thank you for taking good care of your health.',
  },
  {
    hindi: 'धन्यवाद सविता जी! यह दवाई आपकी सेहत को चुस्त-दुरुस्त रखेगी।',
    english: 'Thank you Savita ji! This medicine will keep you active and healthy.',
  },
  {
    hindi: 'अति उत्तम सविता जी! आपकी यह खुराक सफलतापूर्वक दर्ज हो गई है।',
    english: 'Excellent Savita ji! This dose has been safely recorded.',
  },
  {
    hindi: 'सविता जी, बहुत बढ़िया! राहुल और परिवार को आपकी सेहत की तसल्ली रहेगी।',
    english: 'Savita ji, great! Rahul and your family will be glad to see this.',
  },
  {
    hindi: 'वाह सविता जी! आपने नियम से अपनी दवाई ले ली, बहुत खूब।',
    english: 'Wonderful Savita ji! You stayed right on your routine today.',
  },
  {
    hindi: 'शाबाश! आपने आज की खुराक पूरी कर ली, ऐसे ही अपना ख्याल रखिए।',
    english: 'Good job! You completed this dose, keep taking good care of yourself.',
  },
  {
    hindi: 'सविता जी, आपकी यह खुराक दर्ज हो चुकी है। अब थोड़ा आराम कीजिए।',
    english: 'Savita ji, your dose is recorded. Please take some restful time now.',
  },
  {
    hindi: 'बहुत अच्छा सविता जी! समय पर दवाई लेना ही अच्छी सेहत का राज़ है।',
    english: 'Very good Savita ji! Taking medicines on time is the key to vitality.',
  },
  {
    hindi: 'सविता जी, आपकी खुराक पूरी हुई। दिन भर तरोताज़ा और स्वस्थ रहिए।',
    english: 'Savita ji, your dose is complete. Stay refreshed and well all day.',
  },
  {
    hindi: 'शाबाश सविता जी! आपने आज की दिनचर्या का पूरा पालन किया है।',
    english: 'Well done Savita ji! Following your doctor schedule keeps you safe.',
  },
  {
    hindi: 'धन्यवाद सविता जी! आपकी समय की पाबंदी देखकर बहुत खुशी हुई।',
    english: 'Thank you Savita ji! Your punctuality makes your care team proud.',
  },
];

export default function SeniorModePage() {
  const { schedule, nextDueSlot, takenCount, totalCount, confirmDose, refresh } = useAdherence('patient_savita_sharma');
  const { speak, isSpeaking, isLoadingVoice } = useVoiceAnnouncement();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Default language is English in text, Hindi in voice
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [lastAction, setLastAction] = useState<{ doseId: string; medName: string } | null>(null);
  const [undoTimer, setUndoTimer] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);
  const [praiseIndex, setPraiseIndex] = useState(0);
  const [selectedDoseId, setSelectedDoseId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/appointments?patientId=patient_savita_sharma')
      .then((res) => res.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch((err) => console.error('Failed to load appointments:', err));
  }, []);

  // Determine active slot: user-selected slot takes precedence; otherwise next due slot
  const activeSlot = (selectedDoseId ? schedule.find((s) => s.doseId === selectedDoseId) : null) || nextDueSlot;

  const handleMarkTaken = async (slot: any) => {
    const visual = slot.visualIdentity;
    const currentPraise = PRAISE_MODES[praiseIndex % PRAISE_MODES.length];
    setPraiseIndex((prev) => prev + 1);

    // Speak culturally authentic, varied praise
    speak(currentPraise.hindi, { lang: 'hi-IN', englishFallbackText: currentPraise.english });

    const displayedName = language === 'HI' 
      ? (visual?.purposeLabelHindi || slot.medicationName)
      : (visual?.purposeLabelEnglish || slot.medicationName);

    setLastAction({ doseId: slot.doseId, medName: displayedName });

    if (undoTimer) clearTimeout(undoTimer);
    const timer = window.setTimeout(() => setLastAction(null), 10000);
    setUndoTimer(timer);

    // Clear manually selected dose so queue smoothly transitions to the next scheduled slot
    setSelectedDoseId(null);

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
      setSelectedDoseId(null);
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

  const isAllCompleted = totalCount > 0 && takenCount >= totalCount;

  return (
    <main className="min-h-screen pb-16 bg-gradient-to-br from-emerald-50/20 via-slate-50 to-teal-50/25 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Glass Navigation Bar */}
      <nav
        aria-label="Clinical Navigation"
        className="px-4 md:px-8 py-3 bg-white/80 backdrop-blur-xl border-b border-white/60 sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-xs md:text-sm min-h-[38px] px-4 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white text-slate-700 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>{language === 'HI' ? 'मुख्य पृष्ठ' : 'Exit to Home'}</span>
          </Link>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'HI' ? 'EN' : 'HI')}
            className={`px-4 py-1.5 rounded-full font-bold text-xs md:text-sm border flex items-center gap-1.5 min-h-[38px] shadow-sm transition-all active:scale-95 ${
              language === 'HI'
                ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white border-emerald-800'
                : 'bg-white/90 text-slate-800 border-slate-200/80 hover:bg-white'
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
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{todayFormatted} • New Delhi</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-1">
              {language === 'HI' ? 'नमस्ते, सविता जी' : 'Hello, Savita ji'}
            </h1>
            <p className="text-xs md:text-sm font-medium text-slate-500 mt-0.5">
              {language === 'HI'
                ? 'अपनी गोली की पहचान चित्र और दैनिक दिनचर्या से करें।'
                : 'Identify each medication by its direct tablet photo, dosage, and scheduled routine.'}
            </p>
          </div>

          {/* Doses Progress Counter & Test Reset Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSchedule}
              disabled={resetting}
              className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 shadow-sm transition-all active:scale-95"
              title="Reset doses to pending to test the flow again"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-emerald-700' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Doses (Test)'}</span>
            </button>

            <div className="rounded-2xl px-4 py-2.5 bg-white/85 backdrop-blur-xl border border-white/80 flex items-center gap-3 shadow-[0_8px_30px_rgba(5,150,105,0.06)] ring-1 ring-slate-900/5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-sm md:text-base flex items-center justify-center shadow-md shadow-emerald-700/20">
                {takenCount}/{totalCount}
              </div>
              <div>
                <div className="font-bold text-[11px] uppercase tracking-wide text-slate-500">
                  {language === 'HI' ? "आज की दवाइयाँ" : "Today's Doses"}
                </div>
                <div className="text-xs font-bold text-emerald-800">
                  {isAllCompleted
                    ? (language === 'HI' ? 'सभी दवाइयाँ पूर्ण!' : 'All Doses Taken!')
                    : (language === 'HI' ? `${totalCount - takenCount} बाकी है` : `${totalCount - takenCount} Remaining`)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 10-Second Undo Alert Bar */}
        {lastAction && (
          <div className="mb-6 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xl border border-emerald-400/40 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
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
              className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-amber-300 shadow-sm transition-all"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{language === 'HI' ? 'वापस लें' : 'Undo'}</span>
            </button>
          </div>
        )}

        {/* SIDE-BY-SIDE RESPONSIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: ACTIVE DOSE HERO + CAREGIVER / CLINIC ACCESS */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Due Dose Card or Celebratory All-Done */}
            {!isAllCompleted && activeSlot ? (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{language === 'HI' ? 'सक्रिय निर्धारित खुराक' : 'Active Scheduled Dose'}</span>
                  </span>
                  {selectedDoseId && (
                    <button
                      onClick={() => setSelectedDoseId(null)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline"
                    >
                      {language === 'HI' ? 'वर्तमान खुराक पर लौटें' : 'Back to current due'}
                    </button>
                  )}
                </div>
                <MedicationCard
                  slot={activeSlot}
                  onTaken={handleMarkTaken}
                  onSnooze={handleSnooze}
                  onSpeak={speak}
                  isSpeaking={isSpeaking}
                  isLoadingVoice={isLoadingVoice}
                  language={language}
                />
              </div>
            ) : (
              <div className="rounded-3xl p-6 text-center bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_16px_40px_rgba(5,150,105,0.08)] ring-1 ring-slate-900/5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-700/20">
                  <Check className="w-8 h-8 stroke-[3]" />
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
                  className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs inline-flex items-center gap-2 active:scale-95 shadow-md shadow-emerald-700/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{language === 'HI' ? 'परीक्षण हेतु पुनः शुरू करें' : 'Reset Doses to Test Again'}</span>
                </button>
              </div>
            )}

            {/* Quick Caregiver Emergency Call Card */}
            <div className="rounded-3xl p-5 bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>{language === 'HI' ? 'परिवार व केयरटेकर संपर्क' : 'Caregiver Direct Access'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+919810123456"
                  className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-100" />
                  <span>{language === 'HI' ? 'राहुल (बेटा)' : 'Call Rahul (Son)'}</span>
                </a>

                <a
                  href="tel:+919820234567"
                  className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-300" />
                  <span>{language === 'HI' ? 'प्रिया (बेटी)' : 'Call Priya (Daughter)'}</span>
                </a>
              </div>
            </div>

            {/* Doctor Appointment Card */}
            {appointments.length > 0 && (
              <div className="rounded-3xl p-5 bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'HI' ? 'आगामी डॉक्टर अपॉइंटमेंट' : 'Upcoming Doctor Visit'}</span>
                </div>

                {appointments.slice(0, 1).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {appt.doctorName}
                      </h4>
                      <p className="text-xs text-slate-500">{appt.clinicHospital}</p>
                      <div className="text-xs font-bold text-emerald-800 mt-1 flex items-center gap-1">
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
                      className="py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{language === 'HI' ? 'कॉल' : 'Call'}</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TODAY'S FULL TIMELINE LIST */}
          <div className="lg:col-span-7 bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-5 md:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {language === 'HI' ? 'आज की पूरी दिनचर्या' : "Today's Medication Routine"}
                </h2>
                <p className="text-xs text-slate-500">
                  {schedule.length} {language === 'HI' ? 'दवाइयाँ निर्धारित' : 'scheduled doses'} • Click any medicine to inspect
                </p>
              </div>

              <button
                onClick={handleResetSchedule}
                disabled={resetting}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/60"
                title="Reset all doses"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'HI' ? 'रीसेट' : 'Reset'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {schedule.map((item) => {
                const isDone = item.status === 'ADMINISTERED';
                const isSelected = activeSlot?.doseId === item.doseId;
                const visual = item.visualIdentity || {
                  shape: 'ROUND_TABLET' as const,
                  color: '#059669',
                  colorLabelEnglish: 'Round Tablet',
                  colorLabelHindi: 'गोल गोली',
                  purposeLabelEnglish: 'Routine Dose',
                  purposeLabelHindi: 'दवाई',
                  instructionsEnglish: item.instructions,
                  instructionsHindi: item.instructions,
                  mealTimingEnglish: 'Take with water',
                  mealTimingHindi: 'पानी के साथ लें',
                  voiceHindiScript: `सविता जी, यह आपकी दवाई ${item.medicationName} है।`,
                  voiceEnglishScript: `Savita ji, this is your medication ${item.medicationName}.`,
                  photoUrl: undefined,
                  photoAlt: undefined,
                };

                return (
                  <div
                    key={item.doseId}
                    onClick={() => setSelectedDoseId(item.doseId)}
                    className={`rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/80 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/30'
                        : isDone
                        ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                        : 'bg-white/90 border-slate-200/70 hover:border-emerald-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Direct Medicine Image Thumbnail */}
                      {visual.photoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={visual.photoUrl}
                          alt={visual.photoAlt || item.medicationName}
                          className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-200/80 p-1 shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="shrink-0 p-2 rounded-xl bg-white border border-slate-200">
                          <PillGraphic
                            shape={visual.shape}
                            color={visual.color}
                            secondaryColor={visual.secondaryColor}
                            size="sm"
                          />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm md:text-base text-slate-900 truncate">
                            {language === 'HI' ? visual.purposeLabelHindi : item.medicationName}
                          </span>
                          <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {item.dosage}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {language === 'HI' ? visual.colorLabelHindi : visual.colorLabelEnglish}
                        </div>

                        <div className="text-[11px] font-bold text-emerald-800 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{item.scheduledTimeStr} {parseInt(item.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
                          </span>
                          <span>•</span>
                          <span>{language === 'HI' ? visual.mealTimingHindi : visual.mealTimingEnglish}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isDone ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{language === 'HI' ? 'पूर्ण' : 'TAKEN'}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkTaken(item)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{language === 'HI' ? 'दवाई ली' : 'TAKE'}</span>
                        </button>
                      )}

                      {/* Pure Voice Button: Speaks Sarvam AI Hindi or English audio without changing dose status */}
                      <button
                        onClick={() => speak(visual.voiceHindiScript, { lang: 'hi-IN', englishFallbackText: visual.voiceEnglishScript })}
                        disabled={isLoadingVoice}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 active:scale-95 transition-all"
                        title="Listen with Sarvam AI"
                        aria-label="Listen with Sarvam AI"
                      >
                        {isLoadingVoice ? <Loader2 className="w-4 h-4 animate-spin text-emerald-700" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
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
