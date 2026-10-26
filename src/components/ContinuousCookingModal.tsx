import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Flame,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { Recipe, ActiveTimer } from '../types';
import { playChime, playTimerAlarm, playSuccessCelebration } from '../utils/audio';
import { speakStep, stopSpeaking } from '../utils/speech';
import confetti from 'canvas-confetti';

interface ContinuousCookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  initialRecipes?: Recipe[];
}

interface QueuedDish {
  recipe: Recipe;
  activeStep: number;
  completedSteps: boolean[];
}

export const ContinuousCookingModal: React.FC<ContinuousCookingModalProps> = ({
  isOpen,
  onClose,
  recipes,
  initialRecipes = []
}) => {
  // Up to 3 parallel dishes in Mom's Continuous Kitchen
  const [dishes, setDishes] = useState<QueuedDish[]>([]);
  const [activeDishIdx, setActiveDishIdx] = useState(0);
  const [voiceActive, setVoiceActive] = useState(true);
  const [parallelTimers, setParallelTimers] = useState<ActiveTimer[]>([]);
  const [showAddDishMenu, setShowAddDishMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize dishes when opened
  useEffect(() => {
    if (isOpen) {
      if (initialRecipes.length > 0) {
        setDishes(
          initialRecipes.map((r) => ({
            recipe: r,
            activeStep: 0,
            completedSteps: new Array(r.steps.length).fill(false)
          }))
        );
      } else if (recipes.length > 0) {
        // Default pair: Dal Khichdi + Gujarati Kadhi
        const pair = [recipes[0], recipes[1]].filter(Boolean);
        setDishes(
          pair.map((r) => ({
            recipe: r,
            activeStep: 0,
            completedSteps: new Array(r.steps.length).fill(false)
          }))
        );
      }
    }
  }, [isOpen, initialRecipes, recipes]);

  // Read step out loud when dish or step changes if voice is enabled
  useEffect(() => {
    if (!isOpen || dishes.length === 0) return;
    const current = dishes[activeDishIdx];
    if (current && voiceActive) {
      const stepText = `Step ${current.activeStep + 1} for ${current.recipe.title}: ${
        current.recipe.steps[current.activeStep]
      }`;
      speakStep(stepText);
    }
    return () => {
      stopSpeaking();
    };
  }, [activeDishIdx, dishes, isOpen, voiceActive]);

  // Timer countdown interval
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setParallelTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          const next = t.remainingSeconds - 1;
          if (next === 0) {
            playTimerAlarm();
          }
          return { ...t, remainingSeconds: next };
        })
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  if (!isOpen || dishes.length === 0) return null;

  const currentDish = dishes[activeDishIdx];
  const currentStep = currentDish ? currentDish.activeStep : 0;
  const totalSteps = currentDish ? currentDish.recipe.steps.length : 0;
  const isStepDone = currentDish?.completedSteps[currentStep] || false;

  const handleNextStep = () => {
    playChime('high');
    setDishes((prev) => {
      const updated = [...prev];
      const dish = { ...updated[activeDishIdx] };
      dish.completedSteps[currentStep] = true;
      if (dish.activeStep < dish.recipe.steps.length - 1) {
        dish.activeStep += 1;
      } else {
        // Dish complete!
        checkAllCompleted(updated);
      }
      updated[activeDishIdx] = dish;
      return updated;
    });
  };

  const handlePrevStep = () => {
    playChime('low');
    setDishes((prev) => {
      const updated = [...prev];
      const dish = { ...updated[activeDishIdx] };
      if (dish.activeStep > 0) {
        dish.activeStep -= 1;
      }
      updated[activeDishIdx] = dish;
      return updated;
    });
  };

  const handleToggleStepCheck = () => {
    playChime('med');
    setDishes((prev) => {
      const updated = [...prev];
      const dish = { ...updated[activeDishIdx] };
      dish.completedSteps[currentStep] = !dish.completedSteps[currentStep];
      updated[activeDishIdx] = dish;
      return updated;
    });
  };

  const checkAllCompleted = (currentDishes: QueuedDish[]) => {
    const allDone = currentDishes.every((d) =>
      d.completedSteps.every((s) => s === true)
    );
    if (allDone) {
      setIsCompleted(true);
      playSuccessCelebration();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleStartTimer = (seconds: number, label: string) => {
    playChime('med');
    const newTimer: ActiveTimer = {
      id: `timer-${Date.now()}`,
      recipeId: currentDish.recipe.id,
      recipeTitle: currentDish.recipe.title,
      label,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true
    };
    setParallelTimers((prev) => [...prev, newTimer]);
  };

  const handleRemoveDish = (idxToRemove: number) => {
    if (dishes.length <= 1) return;
    setDishes((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    if (activeDishIdx >= dishes.length - 1) {
      setActiveDishIdx(Math.max(0, dishes.length - 2));
    }
  };

  const handleAddDish = (recipe: Recipe) => {
    if (dishes.length >= 3) return;
    setDishes((prev) => [
      ...prev,
      {
        recipe,
        activeStep: 0,
        completedSteps: new Array(recipe.steps.length).fill(false)
      }
    ]);
    setShowAddDishMenu(false);
    playChime('high');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-5xl h-[95vh] bg-[#FDFBF7] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#EBDDCF]">
        {/* Top Coordinator Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#2D3142] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E06D53] flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-heading">
                  Mom’s Continuous Food Making
                </h2>
                <span className="bg-[#588157] text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                  MULTI-DISH FLOW
                </span>
              </div>
              <p className="text-xs text-white/70">
                Parallel stove burner coordinator & giant hands-free touch screen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice toggle */}
            <button
              onClick={() => {
                setVoiceActive(!voiceActive);
                if (voiceActive) stopSpeaking();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                voiceActive
                  ? 'bg-[#F59E0B] text-black shadow-xs'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {voiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">Voice Assistant</span>
            </button>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-Dish Burner Tabs */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#F7F3EB] border-b border-[#EBDDCF] flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2.5">
            {dishes.map((dish, idx) => {
              const isActive = idx === activeDishIdx;
              const completedCount = dish.completedSteps.filter(Boolean).length;
              const pct = Math.round((completedCount / dish.recipe.steps.length) * 100);

              return (
                <div
                  key={dish.recipe.id}
                  onClick={() => {
                    playChime('med');
                    setActiveDishIdx(idx);
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-white text-[#2D3142] border-[#E06D53] shadow-md ring-2 ring-[#E06D53]/20'
                      : 'bg-[#EFE9DC] text-[#7D7065] border-transparent hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#E06D53]/15 text-[#E06D53] font-bold text-xs">
                    <Flame className="w-4 h-4 text-[#E06D53]" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#E06D53]">Burner {idx + 1}:</span>
                      <span className="text-xs sm:text-sm font-bold text-[#2D3142] truncate max-w-[130px] sm:max-w-[180px]">
                        {dish.recipe.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#7D7065]">
                      <span>Step {dish.activeStep + 1}/{dish.recipe.steps.length}</span>
                      <span>•</span>
                      <span className="text-[#588157] font-semibold">{pct}% done</span>
                    </div>
                  </div>

                  {dishes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDish(idx);
                      }}
                      className="p-1 hover:text-red-500 text-gray-400 rounded-md transition-colors cursor-pointer"
                      title="Remove from stove flow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {dishes.length < 3 && (
              <button
                onClick={() => setShowAddDishMenu(true)}
                className="px-3 py-2 rounded-2xl border border-dashed border-[#E06D53] text-[#E06D53] hover:bg-[#E06D53]/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stovetop Dish ({dishes.length}/3)</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Dish Modal Popup */}
        {showAddDishMenu && (
          <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FDFBF7] rounded-3xl p-5 max-w-md w-full shadow-2xl border border-[#EBDDCF]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#2D3142] font-heading">
                  Queue Another Dish for Mom's Stove
                </h3>
                <button
                  onClick={() => setShowAddDishMenu(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {recipes
                  .filter((r) => !dishes.some((d) => d.recipe.id === r.id))
                  .slice(0, 10)
                  .map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => handleAddDish(rec)}
                      className="p-3 bg-white rounded-xl border border-[#EBDDCF] hover:border-[#E06D53] flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{rec.emoji || '🥘'}</span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-[#2D3142] group-hover:text-[#E06D53]">
                            {rec.title}
                          </p>
                          <p className="text-[11px] text-[#7D7065]">
                            {rec.prepTime + rec.cookTime} mins • {rec.cuisine}
                          </p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-[#E06D53]" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Cooking View Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between bg-[#FDFBF7]">
          {/* Active Dish Context Banner */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E06D53]">
                  Burner {activeDishIdx + 1} Active:
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3142] font-heading mt-0.5">
                  {currentDish.recipe.title}
                </h1>
                <p className="text-sm font-medium text-[#7D7065] italic">
                  {currentDish.recipe.hindiTitle}
                </p>
              </div>

              {/* Step counter badge */}
              <div className="flex items-center gap-2 bg-[#E06D53]/10 text-[#E06D53] px-4 py-2 rounded-2xl font-bold text-sm sm:text-base border border-[#E06D53]/20 shadow-xs">
                <span>Step {currentStep + 1}</span>
                <span className="text-gray-400">/</span>
                <span>{totalSteps}</span>
              </div>
            </div>

            {/* Giant Step Instruction Card for Countertop Distance Reading */}
            <div
              onClick={handleToggleStepCheck}
              className={`p-6 sm:p-8 rounded-3xl border-2 transition-all cursor-pointer shadow-kitchen-lg relative select-none ${
                isStepDone
                  ? 'bg-[#EBF5EE] border-[#588157]'
                  : 'bg-white border-[#EBDDCF] hover:border-[#E06D53]'
              }`}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStepCheck();
                  }}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer mt-1 ${
                    isStepDone
                      ? 'bg-[#588157] text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 hover:text-[#588157] hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>

                <div className="flex-1">
                  <p
                    className={`text-xl sm:text-2xl lg:text-3xl font-semibold leading-relaxed transition-all ${
                      isStepDone ? 'line-through text-gray-500' : 'text-[#2D3142]'
                    }`}
                  >
                    {currentDish.recipe.steps[currentStep]}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#7D7065] font-medium bg-gray-100 px-3 py-1 rounded-full">
                      👉 Tap card to check/uncheck
                    </span>

                    {/* Quick Timer Triggers */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTimer(300, `Burner ${activeDishIdx + 1}: 5m`);
                      }}
                      className="px-3 py-1 rounded-full bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#92400E] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Start 5 min timer</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTimer(600, `Burner ${activeDishIdx + 1}: 10m`);
                      }}
                      className="px-3 py-1 rounded-full bg-[#E06D53]/15 hover:bg-[#E06D53]/25 text-[#E06D53] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Start 10 min timer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Parallel Timers Tray */}
            {parallelTimers.length > 0 && (
              <div className="p-3 bg-[#2D3142] rounded-2xl text-white flex items-center gap-3 overflow-x-auto shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5 shrink-0">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Stove Timers:</span>
                </span>
                {parallelTimers.map((t) => {
                  const mins = Math.floor(t.remainingSeconds / 60);
                  const secs = t.remainingSeconds % 60;
                  const isDone = t.remainingSeconds === 0;

                  return (
                    <div
                      key={t.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 ${
                        isDone
                          ? 'bg-red-500/20 border-red-500 text-red-300 animate-bounce'
                          : 'bg-white/10 border-white/20 text-white'
                      }`}
                    >
                      <span className="text-xs font-medium">{t.label}:</span>
                      <span className="text-sm font-mono font-bold text-[#F59E0B]">
                        {mins}:{secs < 10 ? `0${secs}` : secs}
                      </span>
                      <button
                        onClick={() =>
                          setParallelTimers((prev) =>
                            prev.filter((item) => item.id !== t.id)
                          )
                        }
                        className="text-xs text-white/50 hover:text-white ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* GIANT HANDS-FREE TOUCH NAVIGATION BAR */}
          <div className="mt-6 pt-4 border-t border-[#EBDDCF] grid grid-cols-2 gap-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`h-20 sm:h-24 rounded-3xl font-heading font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all cursor-pointer select-none active:scale-98 ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                  : 'bg-white text-[#2D3142] hover:bg-gray-50 border-2 border-[#EBDDCF] shadow-kitchen'
              }`}
            >
              <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
              <span>Previous Step</span>
            </button>

            <button
              onClick={handleNextStep}
              className="h-20 sm:h-24 rounded-3xl bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white font-heading font-extrabold text-lg sm:text-2xl flex items-center justify-center gap-3 shadow-kitchen-lg hover:brightness-105 transition-all cursor-pointer select-none active:scale-98"
            >
              <span>{currentStep === totalSteps - 1 ? 'Finish Dish! 🌟' : 'Next Step 👉'}</span>
              <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>

        {/* Celebration Overlay if Complete */}
        {isCompleted && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 border-[#F59E0B] animate-soft-bounce">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E06D53] to-[#F59E0B] text-white flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#2D3142] font-heading">
                Mom, your feast is ready!
              </h3>
              <p className="text-sm text-[#7D7065] mt-2 leading-relaxed">
                You orchestrated all {dishes.length} dishes to perfection on the stove!
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    onClose();
                  }}
                  className="w-full py-4 rounded-2xl bg-[#E06D53] hover:bg-[#c9573f] text-white font-bold font-heading shadow-md transition-all cursor-pointer"
                >
                  Serve Warm to Family ❤️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
