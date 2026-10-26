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
  Loader2
} from 'lucide-react';
import { playChime, playSuccessCelebration } from '../utils/audio';

interface AskChefMomBarProps {
  onGenerate: (craving: string, servings: number) => Promise<void>;
  isLoading: boolean;
  inStockPantryCount: number;
}

export const AskChefMomBar: React.FC<AskChefMomBarProps> = ({
  onGenerate,
  isLoading,
  inStockPantryCount
}) => {
  const [servings, setServings] = useState(4);
  const [cravingText, setCravingText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    playChime('high');
    await onGenerate(cravingText.trim(), servings);
    setCravingText('');
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

            {/* Servings Counter Pill */}
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
        </form>
      )}
    </div>
  );
};
