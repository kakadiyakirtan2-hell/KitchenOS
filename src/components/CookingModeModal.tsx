import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Users,
  Play,
  Pause,
  RotateCcw,
  Heart,
  BookOpen,
  Calendar,
  Flame,
  Award
} from 'lucide-react';
import { Recipe, RecipeNote, MealJournalEntry, MealSlot } from '../types';
import { playChime, playTimerAlarm, playSuccessCelebration } from '../utils/audio';
import { speakStep, stopSpeaking } from '../utils/speech';
import confetti from 'canvas-confetti';

interface CookingModeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTechnique?: (techniqueId: string) => void;
  onLogCooked?: (entry: Omit<MealJournalEntry, 'id' | 'timestamp'>) => void;
  onSaveNote?: (note: RecipeNote) => void;
  savedNote?: RecipeNote;
  currentMealSlot: MealSlot;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onOpenTechnique,
  onLogCooked,
  onSaveNote,
  savedNote,
  currentMealSlot
}) => {
  if (!isOpen || !recipe) return null;

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(() =>
    new Array(recipe.steps.length).fill(false)
  );
  const [servings, setServings] = useState<number>(recipe.servings || 4);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Active Embedded Countdown Timer state
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Completion modal state
  const [isFinished, setIsFinished] = useState(false);
  const [momNoteText, setMomNoteText] = useState(savedNote?.note || '');
  const [rating, setRating] = useState(savedNote?.rating || 5);
  const [loggedToday, setLoggedToday] = useState(false);

  // Reset state when recipe changes
  useEffect(() => {
    setCurrentStepIdx(0);
    setCompletedSteps(new Array(recipe.steps.length).fill(false));
    setServings(recipe.servings || 4);
    setIsFinished(false);
    setActiveTimerSeconds(null);
    setIsTimerRunning(false);
    setLoggedToday(false);
    setMomNoteText(savedNote?.note || '');
    setRating(savedNote?.rating || 5);
  }, [recipe, savedNote]);

  // Read current step aloud with Web Speech API
  useEffect(() => {
    if (isOpen && recipe && voiceEnabled && !isFinished) {
      const stepText = `Step ${currentStepIdx + 1} of ${recipe.steps.length}: ${
        recipe.steps[currentStepIdx]
      }`;
      speakStep(stepText);
    }
    return () => {
      stopSpeaking();
    };
  }, [currentStepIdx, isOpen, recipe, voiceEnabled, isFinished]);

  // Visual Timer Countdown Interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && activeTimerSeconds !== null && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            playTimerAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimerSeconds]);

  const handleNextStep = () => {
    playChime('high');
    // Mark current step complete
    setCompletedSteps((prev) => {
      const copy = [...prev];
      copy[currentStepIdx] = true;
      return copy;
    });

    if (currentStepIdx < recipe.steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      // Dish Complete Celebration!
      handleFinishDish();
    }
  };

  const handlePrevStep = () => {
    playChime('low');
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleToggleCurrentStep = () => {
    playChime('med');
    setCompletedSteps((prev) => {
      const copy = [...prev];
      copy[currentStepIdx] = !copy[currentStepIdx];
      return copy;
    });
  };

  const handleFinishDish = () => {
    setIsFinished(true);
    playSuccessCelebration();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  const handleStartTimer = (seconds: number) => {
    playChime('high');
    setTotalTimerSeconds(seconds);
    setActiveTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const handleSaveNoteAndLog = () => {
    playChime('high');
    if (onSaveNote) {
      onSaveNote({
        recipeId: recipe.id,
        note: momNoteText,
        rating,
        isFavorite: savedNote?.isFavorite || true,
        lastCooked: new Date().toISOString()
      });
    }

    if (onLogCooked && !loggedToday) {
      const today = new Date().toISOString().split('T')[0];
      onLogCooked({
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        cuisine: recipe.cuisine,
        mealSlot: currentMealSlot,
        date: today,
        note: momNoteText,
        rating,
        servings
      });
      setLoggedToday(true);
    }

    onClose();
  };

  // Helper to multiply ingredient quantity based on selected servings
  const formatMultipliedQty = (qtyStr: string) => {
    const ratio = servings / (recipe.servings || 4);
    if (ratio === 1) return qtyStr;

    // Matches numbers or fractions like "1/2 cup", "2 tbsp", "1.5 cups"
    return qtyStr.replace(/(\d+(\.\d+)?|\d+\/\d+)/g, (match) => {
      if (match.includes('/')) {
        const [num, den] = match.split('/').map(Number);
        const val = (num / den) * ratio;
        return Number.isInteger(val) ? val.toString() : val.toFixed(1);
      }
      const val = parseFloat(match) * ratio;
      return Number.isInteger(val) ? val.toString() : val.toFixed(1);
    });
  };

  const totalSteps = recipe.steps.length;
  const isCurrentStepDone = completedSteps[currentStepIdx] || false;
  const progressPercent = Math.round(((currentStepIdx + 1) / totalSteps) * 100);

  // Extract timer from current step text if any (e.g. 5 mins, 10 mins, 15 seconds)
  const currentStepText = recipe.steps[currentStepIdx];
  const detectedTimerMatch = currentStepText.match(/(\d+)\s*(mins|min|minutes|whistles)/i);
  let stepTimerSeconds = 300; // default 5m
  if (detectedTimerMatch) {
    const num = parseInt(detectedTimerMatch[1], 10);
    stepTimerSeconds = num * 60;
  } else if (recipe.timers && recipe.timers[currentStepIdx]) {
    stepTimerSeconds = recipe.timers[currentStepIdx];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-5xl h-[95vh] bg-[#FDFBF7] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#EBDDCF]">
        {/* Top Header */}
        <div className="px-5 sm:px-8 py-3.5 bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{recipe.emoji || '🍲'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-heading">
                  {recipe.title}
                </h2>
                <span className="hidden sm:inline-block bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {recipe.cuisine}
                </span>
              </div>
              <p className="text-xs text-white/90">
                Step {currentStepIdx + 1} of {totalSteps} • Distraction-Free Kitchen Mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Voice toggle button */}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) stopSpeaking();
              }}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                voiceEnabled
                  ? 'bg-white text-[#E06D53] shadow-xs'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
              title={voiceEnabled ? 'Mute Speech Read-Out' : 'Enable Speech Read-Out'}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span className="hidden md:inline">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EBDDCF] h-2">
          <div
            className="bg-gradient-to-r from-[#E06D53] to-[#F59E0B] h-2 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Cooking Mode Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between bg-[#FDFBF7]">
          <div className="flex flex-col gap-6">
            {/* Context & Serving Multiplier Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EBDDCF] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7D7065] uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-4 h-4 text-[#E06D53]" />
                  Serving Size:
                </span>
                <div className="flex items-center bg-[#F7F3EB] rounded-xl p-0.5 border border-[#E8DEC8]">
                  {[2, 4, 6, 8].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        playChime('med');
                        setServings(s);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        servings === s
                          ? 'bg-[#E06D53] text-white shadow-xs'
                          : 'text-[#2D3142] hover:bg-white/60'
                      }`}
                    >
                      {s} ppl
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe techniques link if available */}
              {recipe.techniques && recipe.techniques.length > 0 && onOpenTechnique && (
                <button
                  onClick={() => onOpenTechnique(recipe.techniques![0])}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#92400E] text-xs font-bold flex items-center gap-1.5 border border-[#F59E0B]/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Watch Technique Video Animation</span>
                </button>
              )}
            </div>

            {/* GIANT STEP INSTRUCTION CARD (Mom Friendly UX) */}
            <div
              onClick={handleToggleCurrentStep}
              className={`p-6 sm:p-10 rounded-3xl border-2 transition-all cursor-pointer shadow-kitchen-lg relative select-none ${
                isCurrentStepDone
                  ? 'bg-[#EBF5EE] border-[#588157]'
                  : 'bg-white border-[#EBDDCF] hover:border-[#E06D53]'
              }`}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCurrentStep();
                  }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer mt-1 ${
                    isCurrentStepDone
                      ? 'bg-[#588157] text-white shadow-md'
                      : 'bg-[#F7F3EB] text-[#7D7065] hover:text-[#588157] hover:bg-gray-200 border border-[#E8DEC8]'
                  }`}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E06D53] mb-1">
                    <span>STEP {currentStepIdx + 1} OF {totalSteps}</span>
                    {isCurrentStepDone && (
                      <span className="text-[#588157] font-bold bg-[#588157]/15 px-2 py-0.5 rounded-full">
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xl sm:text-2xl lg:text-3xl font-semibold leading-relaxed transition-all ${
                      isCurrentStepDone ? 'line-through text-gray-500' : 'text-[#2D3142]'
                    }`}
                  >
                    {currentStepText}
                  </p>

                  <p className="text-xs text-[#7D7065] mt-4">
                    💡 Mom, tap this card or checkmark to check off the step with golden sparkle!
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded Visual Timers & Ingredient Checklist Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Circular Countdown Timer Widget (5 Cols) */}
              <div className="md:col-span-5 bg-white p-5 rounded-3xl border border-[#EBDDCF] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D3142] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#E06D53]" />
                    <span>Step Kitchen Timer</span>
                  </span>

                  {activeTimerSeconds !== null && (
                    <button
                      onClick={() => {
                        setActiveTimerSeconds(null);
                        setIsTimerRunning(false);
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Circular timer or quick start buttons */}
                {activeTimerSeconds !== null ? (
                  <div className="flex items-center gap-4 py-2">
                    {/* Circular Progress Ring */}
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="#F7F3EB"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="#E06D53"
                          strokeWidth="6"
                          strokeDasharray={213}
                          strokeDashoffset={
                            totalTimerSeconds
                              ? 213 - (213 * activeTimerSeconds) / totalTimerSeconds
                              : 0
                          }
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-300"
                        />
                      </svg>
                      <span className="absolute text-sm font-mono font-bold text-[#2D3142]">
                        {Math.floor(activeTimerSeconds / 60)}:
                        {activeTimerSeconds % 60 < 10
                          ? `0${activeTimerSeconds % 60}`
                          : activeTimerSeconds % 60}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-bold text-[#2D3142]">
                        {isTimerRunning ? 'Timer ticking...' : 'Timer paused'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className="px-3 py-1.5 rounded-xl bg-[#E06D53] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
                        </button>
                        <button
                          onClick={() => setActiveTimerSeconds((prev) => (prev || 0) + 60)}
                          className="px-2.5 py-1.5 rounded-xl bg-gray-100 text-[#2D3142] text-xs font-bold hover:bg-gray-200 cursor-pointer"
                        >
                          +1 min
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 py-2">
                    <button
                      onClick={() => handleStartTimer(stepTimerSeconds)}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start {Math.round(stepTimerSeconds / 60)} Min Timer</span>
                    </button>
                    <button
                      onClick={() => handleStartTimer(120)}
                      className="px-3 py-2 rounded-2xl bg-[#F7F3EB] hover:bg-[#EBDDCF] text-[#2D3142] text-xs font-bold cursor-pointer"
                    >
                      2 mins
                    </button>
                    <button
                      onClick={() => handleStartTimer(600)}
                      className="px-3 py-2 rounded-2xl bg-[#F7F3EB] hover:bg-[#EBDDCF] text-[#2D3142] text-xs font-bold cursor-pointer"
                    >
                      10 mins
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-[#7D7065] mt-1">
                  Alert chime will chime automatically when time is up.
                </p>
              </div>

              {/* Dynamic Ingredients for this Recipe (7 Cols) */}
              <div className="md:col-span-7 bg-[#F7F3EB] p-4 rounded-3xl border border-[#EBDDCF]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D3142] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#588157]" />
                    <span>Ingredients ({servings} Servings):</span>
                  </span>
                  <span className="text-[11px] text-[#7D7065]">
                    Quantities adjusted dynamically
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                  {recipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded-xl border border-[#E8DEC8] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#2D3142] truncate mr-2">
                        {ing.name}
                      </span>
                      <span className="font-bold text-[#E06D53] shrink-0">
                        {formatMultipliedQty(ing.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mom's Secret Tip */}
            {recipe.momSecretTip && (
              <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#F5D8BA] flex items-start gap-3 shadow-xs">
                <span className="text-xl">👩‍🍳</span>
                <div>
                  <h4 className="text-xs font-bold text-[#8C3A00] uppercase tracking-wider">
                    Mom’s Secret Golden Tip:
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5C3B1E] mt-0.5 font-medium leading-relaxed">
                    {recipe.momSecretTip}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* OVERSIZED NAVIGATION CONTROLS (Mom Friendly Tap Targets) */}
          <div className="mt-6 pt-4 border-t border-[#EBDDCF] grid grid-cols-2 gap-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIdx === 0}
              className={`h-16 sm:h-20 rounded-3xl font-heading font-bold text-base sm:text-xl flex items-center justify-center gap-3 transition-all cursor-pointer select-none active:scale-98 ${
                currentStepIdx === 0
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                  : 'bg-white text-[#2D3142] hover:bg-gray-50 border-2 border-[#EBDDCF] shadow-kitchen'
              }`}
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              <span>Previous Step</span>
            </button>

            <button
              onClick={handleNextStep}
              className="h-16 sm:h-20 rounded-3xl bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white font-heading font-extrabold text-base sm:text-2xl flex items-center justify-center gap-3 shadow-kitchen-lg hover:brightness-105 transition-all cursor-pointer select-none active:scale-98"
            >
              <span>{currentStepIdx === totalSteps - 1 ? 'Finish Dish! 🌟' : 'Next Step 👉'}</span>
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>

        {/* COMPLETION CELEBRATION MODAL (Feature E & Delights) */}
        {isFinished && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="bg-[#FDFBF7] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl border-2 border-[#F59E0B] animate-soft-bounce flex flex-col gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E06D53] to-[#F59E0B] text-white flex items-center justify-center mx-auto shadow-xl">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2D3142] font-heading">
                  Mom, your dish looks delicious!
                </h3>
                <p className="text-sm text-[#7D7065] mt-1.5 leading-relaxed">
                  Congratulations! You prepared{' '}
                  <span className="font-bold text-[#E06D53]">{recipe.title}</span> with love for {servings} people.
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      playChime('med');
                      setRating(star);
                    }}
                    className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>

              {/* Mom's Personal Note on Recipe */}
              <div className="text-left">
                <label className="text-xs font-bold text-[#2D3142] uppercase tracking-wider block mb-1.5">
                  Mom’s Kitchen Note & Secret Tweak:
                </label>
                <textarea
                  value={momNoteText}
                  onChange={(e) => setMomNoteText(e.target.value)}
                  placeholder="e.g., Kids loved this with extra roasted cumin; cook 2 whistles next time!"
                  rows={2}
                  className="w-full p-3 rounded-2xl bg-white border border-[#EBDDCF] text-xs sm:text-sm text-[#2D3142] focus:outline-none focus:border-[#E06D53]"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleSaveNoteAndLog}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white font-bold font-heading shadow-md hover:brightness-105 transition-all cursor-pointer text-base"
                >
                  Save in Mom’s Meal Journal & Notes ✨
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#2D3142] font-bold text-sm transition-all cursor-pointer"
                >
                  Close & Return to Kitchen Studio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
