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
  UserCheck
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
    english: 'Savita ji, your dose is done. Wishing you good health throughout the day.',
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
    <main className="min-h-screen pb-16 bg-white text-black antialiased selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Clinical Navigation Bar: Green, Black, White */}
      <nav
        aria-label="Clinical Navigation"
        className="px-4 md:px-8 py-3 bg-white border-b-2 border-black sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-black text-xs md:text-sm min-h-[38px] px-4 rounded-xl border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-black stroke-[2.5]" />
            <span>{language === 'HI' ? 'मुख्य पृष्ठ' : 'EXIT TO HOME'}</span>
          </Link>

          {/* Language Toggle: Monochrome Black & Green */}
          <button
            onClick={() => setLanguage(language === 'HI' ? 'EN' : 'HI')}
            className={`px-4 py-1.5 rounded-xl font-black text-xs md:text-sm border-2 border-black flex items-center gap-1.5 min-h-[38px] shadow-sm transition-all active:scale-95 ${
              language === 'HI'
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-black hover:bg-zinc-100'
            }`}
            aria-label="Toggle language"
          >
            <Languages className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'HI' ? 'भाषा: हिंदी' : 'LANGUAGE: ENGLISH'}</span>
          </button>
        </div>
      </nav>

      {/* Main Container: Wide Max Width for Side-by-Side Layout */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Bar: Green, Black, White */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>{todayFormatted} • NEW DELHI</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-black mt-1">
              {language === 'HI' ? 'नमस्ते, सविता जी' : 'Hello, Savita ji'}
            </h1>
            <p className="text-xs md:text-sm font-bold text-zinc-600 mt-0.5">
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
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-black font-black text-xs flex items-center gap-1.5 border-2 border-black shadow-sm transition-all active:scale-95"
              title="Reset doses to pending to test the flow again"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'RESETTING...' : 'RESET DOSES (TEST)'}</span>
            </button>

            <div className="rounded-2xl px-4 py-2 bg-white border-2 border-black flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-sm md:text-base flex items-center justify-center border border-black">
                {takenCount}/{totalCount}
              </div>
              <div>
                <div className="font-black text-[10px] uppercase tracking-wider text-zinc-600">
                  {language === 'HI' ? "आज की दवाइयाँ" : "TODAY'S DOSES"}
                </div>
                <div className="text-xs font-black text-emerald-800">
                  {isAllCompleted
                    ? (language === 'HI' ? 'सभी दवाइयाँ पूर्ण!' : 'ALL DOSES TAKEN')
                    : (language === 'HI' ? `${totalCount - takenCount} बाकी है` : `${totalCount - takenCount} REMAINING`)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 10-Second Undo Alert Bar: Green & Black */}
        {lastAction && (
          <div className="mb-6 bg-black text-white p-3.5 rounded-2xl flex items-center justify-between shadow-lg border-2 border-black animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border border-white">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="font-black text-sm">
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
              className="px-3.5 py-1.5 bg-white text-black font-black text-xs rounded-xl flex items-center gap-1.5 hover:bg-zinc-200 border border-black transition-all"
            >
              <Undo2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{language === 'HI' ? 'वापस लें' : 'UNDO'}</span>
            </button>
          </div>
        )}

        {/* SIDE-BY-SIDE RESPONSIVE GRID (Eliminates empty space on corners) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: ACTIVE DOSE HERO + CAREGIVER / CLINIC ACCESS */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Due Dose Card or Celebratory All-Done */}
            {!isAllCompleted && activeSlot ? (
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>{language === 'HI' ? 'सक्रिय निर्धारित खुराक' : 'ACTIVE SCHEDULED DOSE'}</span>
                  </span>
                  {selectedDoseId && (
                    <button
                      onClick={() => setSelectedDoseId(null)}
                      className="text-[11px] font-bold text-zinc-600 underline hover:text-black"
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
              <div className="rounded-3xl p-6 text-center bg-white border-2 border-black shadow-md">
                <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-3 border-2 border-black shadow-sm">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-black">
                  {language === 'HI' ? 'शाबाश सविता जी!' : 'All Caught Up, Savita ji!'}
                </h2>
                <p className="text-xs md:text-sm font-bold mt-1 text-zinc-700 max-w-sm mx-auto">
                  {language === 'HI'
                    ? 'आज की सभी निर्धारित दवाइयाँ पूरी हो चुकी हैं।'
                    : 'All scheduled medications for today have been taken on time.'}
                </p>
                <button
                  onClick={handleResetSchedule}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-black text-xs inline-flex items-center gap-2 active:scale-95 shadow-sm transition-all border border-black"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{language === 'HI' ? 'परीक्षण हेतु पुनः शुरू करें' : 'RESET DOSES TO TEST AGAIN'}</span>
                </button>
              </div>
            )}

            {/* Quick Caregiver Emergency Call Card: Green, Black, White */}
            <div className="rounded-3xl p-5 bg-white border-2 border-black shadow-sm">
              <div className="text-xs font-black uppercase tracking-wider text-black mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                <span>{language === 'HI' ? 'परिवार व केयरटेकर संपर्क' : 'CAREGIVER DIRECT ACCESS'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+919810123456"
                  className="py-3 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all border border-black"
                >
                  <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{language === 'HI' ? 'राहुल (बेटा)' : 'CALL RAHUL (SON)'}</span>
                </a>

                <a
                  href="tel:+919820234567"
                  className="py-3 px-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all border border-black"
                >
                  <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{language === 'HI' ? 'प्रिया (बेटी)' : 'CALL PRIYA (DAUGHTER)'}</span>
                </a>
              </div>
            </div>

            {/* Doctor Appointment Card: Green, Black, White */}
            {appointments.length > 0 && (
              <div className="rounded-3xl p-5 bg-white border-2 border-black shadow-sm">
                <div className="text-xs font-black uppercase tracking-wider text-black mb-3 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                  <span>{language === 'HI' ? 'आगामी डॉक्टर अपॉइंटमेंट' : 'UPCOMING DOCTOR VISIT'}</span>
                </div>

                {appointments.slice(0, 1).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-black">
                        {appt.doctorName}
                      </h4>
                      <p className="text-xs font-bold text-zinc-600">{appt.clinicHospital}</p>
                      <div className="text-xs font-black text-emerald-800 mt-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
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
                      className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-zinc-100 text-black border-2 border-black font-black text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{language === 'HI' ? 'कॉल' : 'CALL'}</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TODAY'S FULL TIMELINE LIST (Side-by-side) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-black p-5 md:p-6 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
              <div>
                <h2 className="text-lg font-black text-black">
                  {language === 'HI' ? 'आज की पूरी दिनचर्या' : "Today's Medication Routine"}
                </h2>
                <p className="text-xs font-bold text-zinc-600">
                  {schedule.length} {language === 'HI' ? 'दवाइयाँ निर्धारित' : 'scheduled doses'} • Click any medicine to inspect
                </p>
              </div>

              <button
                onClick={handleResetSchedule}
                disabled={resetting}
                className="text-xs font-black text-black hover:bg-zinc-100 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-black bg-white"
                title="Reset all doses"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'HI' ? 'रीसेट' : 'RESET'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {schedule.map((item) => {
                const isDone = item.status === 'ADMINISTERED';
                const isSelected = activeSlot?.doseId === item.doseId;
                const visual = item.visualIdentity || {
                  shape: 'ROUND_TABLET' as const,
                  color: '#000000',
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
                    className={`rounded-2xl p-3.5 border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/50 shadow-md ring-2 ring-emerald-700/20'
                        : isDone
                        ? 'bg-zinc-50 border-zinc-300 opacity-60'
                        : 'bg-white border-black hover:border-emerald-700 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Direct Medicine Image Thumbnail */}
                      {visual.photoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={visual.photoUrl}
                          alt={visual.photoAlt || item.medicationName}
                          className="w-14 h-14 rounded-xl object-contain bg-white border border-black p-1 shrink-0"
                        />
                      ) : (
                        <div className="shrink-0 p-2 rounded-xl bg-white border border-black">
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
                          <span className="font-black text-sm md:text-base text-black truncate">
                            {language === 'HI' ? visual.purposeLabelHindi : item.medicationName}
                          </span>
                          <span className="text-[11px] font-black bg-black text-white px-2 py-0.5 rounded">
                            {item.dosage}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-zinc-600 truncate mt-0.5">
                          {language === 'HI' ? visual.colorLabelHindi : visual.colorLabelEnglish}
                        </div>

                        <div className="text-[11px] font-black text-emerald-800 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-black" />
                            <span>{item.scheduledTimeStr} {parseInt(item.scheduledTimeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
                          </span>
                          <span>•</span>
                          <span>{language === 'HI' ? visual.mealTimingHindi : visual.mealTimingEnglish}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isDone ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center gap-1 border border-black">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'HI' ? 'पूर्ण' : 'TAKEN'}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkTaken(item)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1 border border-black"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{language === 'HI' ? 'दवाई ली' : 'TAKE'}</span>
                        </button>
                      )}

                      {/* Pure Voice Button: Speaks Sarvam AI Hindi or English audio without changing dose status */}
                      <button
                        onClick={() => speak(visual.voiceHindiScript, { lang: 'hi-IN', englishFallbackText: visual.voiceEnglishScript })}
                        disabled={isLoadingVoice}
                        className="p-2.5 rounded-xl bg-white hover:bg-zinc-100 text-black border border-black active:scale-95 transition-all"
                        title="Listen with Sarvam AI"
                        aria-label="Listen with Sarvam AI"
                      >
                        {isLoadingVoice ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
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
