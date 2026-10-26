import React from 'react';
import { X, Sparkles, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { ScoredRecipe } from '../types';
import { playChime } from '../utils/audio';

interface SubstituteModalProps {
  scoredRecipe: ScoredRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  onCookRecipe: (recipe: any) => void;
  onMarkInStock: (ingredientName: string) => void;
}

export const SubstituteModal: React.FC<SubstituteModalProps> = ({
  scoredRecipe,
  isOpen,
  onClose,
  onCookRecipe,
  onMarkInStock
}) => {
  if (!isOpen || !scoredRecipe) return null;

  const { recipe, missingRequired, missingSubstitutes } = scoredRecipe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-3xl shadow-2xl overflow-hidden border border-[#EBDDCF] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F59E0B] to-[#E06D53] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{recipe.emoji || '🥘'}</span>
            <div>
              <h3 className="text-lg font-bold font-heading">
                Smart Kitchen Substitutes
              </h3>
              <p className="text-xs text-white/90 truncate max-w-[260px] sm:max-w-xs">
                For {recipe.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playChime('low');
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-[#FFFBEB] rounded-2xl border border-[#FDE68A] flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-[#92400E] leading-relaxed">
              Mom, you are only missing <strong>{missingRequired.length} item{missingRequired.length > 1 ? 's' : ''}</strong>! Here are quick alternatives you can use right away:
            </p>
          </div>

          <div className="space-y-3">
            {missingSubstitutes.map((sub, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-2xl border border-[#EBDDCF] shadow-xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    Missing: {sub.item}
                  </span>
                  <button
                    onClick={() => {
                      playChime('high');
                      onMarkInStock(sub.item);
                    }}
                    className="text-[11px] font-bold text-[#588157] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>✓ I have substitute</span>
                  </button>
                </div>

                <div className="flex items-start gap-2 text-xs sm:text-sm text-[#2D3142]">
                  <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#8C3A00]">Home Substitute: </span>
                    <span>{sub.substitute}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              playChime('high');
              onClose();
              onCookRecipe(recipe);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white font-bold font-heading shadow-md hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Proceed to Cook with Substitutes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
