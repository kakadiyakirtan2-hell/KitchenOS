import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  Minus,
  Plus,
  Flame,
  ChefHat,
  RotateCcw,
  Send,
  Loader2,
  Key,
  Check,
  X,
  Trash2
} from 'lucide-react';
import { playChime, playSuccessCelebration } from '../utils/audio';
import { getGeminiApiKey, saveUserGeminiKey } from '../services/geminiService';
import { Recipe } from '../types';

interface AskChefMomBarProps {
  onGenerate: (craving: string, servings: number) => Promise<void>;
  isLoading: boolean;
  inStockPantryCount: number;
  recentDishes?: Recipe[];
  onCookRecipe?: (recipe: Recipe) => void;
  onClearRecent?: () => void;
  onDeleteDish?: (id: string) => void;
}

export const AskChefMomBar: React.FC<AskChefMomBarProps> = ({
  onGenerate,
  isLoading,
  inStockPantryCount,
  recentDishes,
  onCookRecipe,
  onClearRecent,
  onDeleteDish
}) => {
  const [servings, setServings] = useState(4);
  const [cravingText, setCravingText] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    playChime('high');
    await onGenerate(cravingText.trim(), servings);
    setCravingText('');
  };

  const handleSaveKey = () => {
    if (customKeyInput.trim()) {
      saveUserGeminiKey(customKeyInput.trim());
      playChime('high');
      setKeySavedToast(true);
      setTimeout(() => {
        setKeySavedToast(false);
        setShowKeyModal(false);
      }, 1200);
    }
  };

  const handleResetKey = () => {
    localStorage.removeItem('moms_rasoi_gemini_api_key');
    setCustomKeyInput('');
    playChime('med');
    setShowKeyModal(false);
  };

  const incrementServings = () => {
    playChime('med');
    setServings((prev) => Math.min(12, prev + 1));
  };

  const decrementServings = () => {
    playChime('med');
    setServings((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="bg-gradient-to-r from-[#FFFBF7] via-[#FFF8F2] to-[#FFF4EC] rounded-3xl p-5 sm:p-6 border-2 border-[#F5D8BE] shadow-kitchen-console relative overflow-hidden">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#E06D53]/10 to-transparent pointer-events-none" />

      {isLoading ? (
        /* Animated Simmering Pot Loading Card */
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center animate-fade-in relative z-10">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E06D53] to-[#F59E0B] text-white flex items-center justify-center shadow-xl animate-halo">
              <span className="text-3xl animate-bounce">🍲</span>
            </div>
            {/* Animated steam wisps */}
            <div className="absolute -top-3 left-6 w-2 h-6 bg-white/60 rounded-full blur-2xs animate-steam" />
            <div className="absolute -top-4 left-10 w-2 h-7 bg-white/80 rounded-full blur-2xs animate-steam" style={{ animationDelay: '0.4s' }} />
          </div>

          <h3 className="text-lg sm:text-xl font-black text-[#2D3142] font-heading">
            Chef Mom & Gemini are planning your meal...
          </h3>
          <p className="text-xs sm:text-sm text-[#7D7065] mt-1 max-w-md leading-relaxed">
            Checking your <strong>{inStockPantryCount} kitchen pantry ingredients</strong> and crafting custom step-by-step recipes for <strong>{servings} people</strong>.
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#E06D53] bg-white px-3.5 py-1.5 rounded-full border border-[#E06D53]/20 shadow-2xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Simmering custom recipes (~2 seconds)</span>
          </div>
        </div>
      ) : (
        /* Quick Input Form */
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          {/* Top Banner Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#E06D53] text-white flex items-center justify-center shadow-md">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#2D3142] font-heading">
                    Ask Chef Mom (Unlimited Gemini Recipes)
                  </h3>
                  <span className="bg-[#E06D53]/15 text-[#E06D53] text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-[#E06D53]/20">
                    Live AI Assistant
                  </span>
                </div>
                <p className="text-[11px] text-[#7D7065]">
                  Have a specific craving? Gemini creates tailor-made dishes using your exact pantry stock.
                </p>
              </div>
            </div>

            {/* Servings Counter Pill & Key Settings */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomKeyInput(localStorage.getItem('moms_rasoi_gemini_api_key') || '');
                  setShowKeyModal(true);
                }}
                title="Gemini API Key Settings"
                className="px-2.5 py-1.5 rounded-2xl bg-white border border-[#E8DEC8] hover:border-[#E06D53] text-[#7D7065] hover:text-[#E06D53] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <Key className="w-3.5 h-3.5 text-[#E06D53]" />
                <span className="hidden sm:inline">API Key</span>
              </button>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-[#E8DEC8] shadow-2xs">
                <span className="text-xs font-bold text-[#7D7065] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#E06D53]" />
                  <span className="hidden sm:inline">Portions:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={decrementServings}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#2D3142] flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black text-[#2D3142] font-mono min-w-[50px] text-center">
                    {servings} {servings === 1 ? 'person' : 'people'}
                  </span>
                  <button
                    type="button"
                    onClick={incrementServings}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#2D3142] flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Input & Glowing Generate Button */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Any specific craving today? (e.g. something light, crispy evening snacks, sweet after dinner, kids tiffin)..."
                value={cravingText}
                onChange={(e) => setCravingText(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-2xl border-2 border-[#EADCCF] text-xs sm:text-sm text-[#2D3142] placeholder:text-gray-400 focus:outline-none focus:border-[#E06D53] shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E06D53] via-[#E87A62] to-[#F59E0B] text-white font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-kitchen-button hover:brightness-105 active:scale-98 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-white animate-spin" style={{ animationDuration: '4s' }} />
              <span>Generate Custom Dishes</span>
            </button>
          </div>

          {/* Instant Freshly Generated Preview Carousel */}
          {recentDishes && recentDishes.length > 0 && (
            <div className="mt-2 pt-4 border-t border-[#F5D8BE] flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎉</span>
                  <span className="text-xs font-black text-[#2D3142] uppercase tracking-wide">
                    Chef Mom Just Prepared {recentDishes.length} Custom Dish{recentDishes.length > 1 ? 'es' : ''} for You:
                  </span>
                </div>
                {onClearRecent && (
                  <button
                    type="button"
                    onClick={onClearRecent}
                    className="text-[11px] font-bold text-gray-400 hover:text-[#E06D53] underline cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentDishes.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl p-3.5 border-2 border-[#E06D53]/30 shadow-xs flex items-center justify-between gap-3 hover:border-[#E06D53] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl p-2 rounded-xl bg-[#FAF6EF] shrink-0">
                        {r.emoji || '🍲'}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-[#2D3142] truncate">
                          {r.title}
                        </h4>
                        {r.hindiTitle && (
                          <p className="text-[11px] text-[#E06D53] font-bold truncate">
                            {r.hindiTitle}
                          </p>
                        )}
                        <p className="text-[10px] text-[#7D7065] mt-0.5">
                          ⏱️ {r.prepTime + r.cookTime} mins • 👥 {r.servings} servings
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onCookRecipe && (
                        <button
                          type="button"
                          onClick={() => onCookRecipe(r)}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white text-xs font-black shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                        >
                          <span>Cook</span>
                          <span>👉</span>
                        </button>
                      )}
                      {onDeleteDish && (
                        <button
                          type="button"
                          onClick={() => onDeleteDish(r.id)}
                          title="Remove dish"
                          className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFBF7] rounded-3xl border-2 border-[#EADCCF] p-5 sm:p-6 max-w-md w-full shadow-kitchen-card flex flex-col gap-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#E06D53]/10 text-[#E06D53]">
                  <Key className="w-4 h-4" />
                </span>
                <h4 className="text-base font-black text-[#2D3142] font-heading">
                  Gemini API Key Settings
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7D7065] leading-relaxed">
              Mom's Rasoi uses Google Gemini to craft custom dishes from your pantry. You can paste your own API key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[#E06D53] font-bold underline">Google AI Studio</a> below, or use the pre-configured studio key.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#7D7065] uppercase">
                Gemini API Key
              </label>
              <input
                type="text"
                placeholder="AIzaSy... or AQ...."
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#D5C7B5] text-xs text-[#2D3142] font-mono focus:outline-none focus:border-[#E06D53]"
              />
              <span className="text-[10px] text-gray-400">
                Key is stored securely only in your browser's localStorage.
              </span>
            </div>

            {keySavedToast && (
              <div className="bg-[#EBF5EE] text-[#1E5224] text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-[#588157]/20">
                <Check className="w-3.5 h-3.5 text-[#588157]" />
                <span>API Key saved successfully!</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8DEC8]">
              <button
                type="button"
                onClick={handleResetKey}
                className="text-xs font-bold text-gray-400 hover:text-[#E06D53] underline cursor-pointer"
              >
                Reset Default Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-2 bg-[#E06D53] hover:bg-[#D05C42] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
