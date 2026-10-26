import React from 'react';
import {
  Clock,
  Users,
  Flame,
  AlertCircle,
  Play,
  Layers,
  Sparkles,
  ChevronRight,
  Heart,
  ChefHat
} from 'lucide-react';
import { ScoredRecipe, Recipe } from '../types';
import { playChime } from '../utils/audio';

interface RecipeCardProps {
  scoredRecipe: ScoredRecipe;
  onCookRecipe: (recipe: Recipe) => void;
  onOpenSubstituteModal?: (scored: ScoredRecipe) => void;
  onOpenTechnique?: (techniqueId: string) => void;
  onQueueContinuous?: (recipe: Recipe) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (recipeId: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  scoredRecipe,
  onCookRecipe,
  onOpenSubstituteModal,
  onOpenTechnique,
  onQueueContinuous,
  isFavorite = false,
  onToggleFavorite
}) => {
  const { recipe, baseScore, finalScore, tier, missingRequired, missingSubstitutes } =
    scoredRecipe;

  const totalTime = recipe.prepTime + recipe.cookTime;

  // Tier styles
  const tierConfig = {
    ready: {
      badge: '🟢 Ready to Cook!',
      badgeClass: 'bg-[#588157]/15 text-[#2E5E2D] border-[#588157]/30',
      borderClass: 'border-[#588157]/40 hover:border-[#588157]',
      scoreColor: 'text-[#2E5E2D]'
    },
    'missing-few': {
      badge: '🟡 Missing 1-2 Items',
      badgeClass: 'bg-[#F59E0B]/15 text-[#92400E] border-[#F59E0B]/30',
      borderClass: 'border-[#F59E0B]/40 hover:border-[#F59E0B]',
      scoreColor: 'text-[#92400E]'
    },
    explore: {
      badge: '⚪ Explore Dish',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
      borderClass: 'border-[#E8DEC8] hover:border-[#E06D53]',
      scoreColor: 'text-gray-700'
    }
  }[tier];

  return (
    <div
      className={`bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between shadow-kitchen hover:shadow-kitchen-lg group relative ${tierConfig.borderClass}`}
    >
      <div>
        {/* Top Header: Tier Badge & Match Score Pill */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${tierConfig.badgeClass}`}
          >
            <span>{tierConfig.badge}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playChime('high');
                  onToggleFavorite(recipe.id);
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  isFavorite
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'text-gray-300 hover:text-red-400 bg-gray-50'
                }`}
                title="Add to Mom's Favorites"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
            )}

            <div
              className={`px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold font-mono ${tierConfig.scoreColor}`}
              title={`Base: ${baseScore}% + Bonus Context`}
            >
              {finalScore}% Match
            </div>
          </div>
        </div>

        {/* Recipe Title & Emoji */}
        <div className="flex items-start gap-3 mb-2">
          <span className="text-3xl shrink-0 p-1.5 bg-[#FDFBF7] rounded-2xl border border-[#EBDDCF]">
            {recipe.emoji || '🍲'}
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#2D3142] font-heading group-hover:text-[#E06D53] transition-colors leading-snug">
              {recipe.title}
            </h3>
            {recipe.hindiTitle && (
              <p className="text-xs font-medium text-[#7D7065] italic">
                {recipe.hindiTitle}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#52576B] line-clamp-2 leading-relaxed mb-3">
          {recipe.description}
        </p>

        {/* Cooking Meta Info Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#7D7065] mb-4">
          <span className="flex items-center gap-1 bg-[#F7F3EB] px-2.5 py-1 rounded-xl font-medium">
            <Clock className="w-3.5 h-3.5 text-[#E06D53]" />
            <span>{totalTime} mins</span>
          </span>
          <span className="flex items-center gap-1 bg-[#F7F3EB] px-2.5 py-1 rounded-xl font-medium">
            <Users className="w-3.5 h-3.5 text-[#588157]" />
            <span>{recipe.servings} Servings</span>
          </span>
          <span className="flex items-center gap-1 bg-[#F7F3EB] px-2.5 py-1 rounded-xl font-medium">
            <ChefHat className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{recipe.difficulty}</span>
          </span>
        </div>

        {/* Missing Ingredients Alert Box for Tier 2 */}
        {tier === 'missing-few' && missingRequired.length > 0 && (
          <div
            onClick={() => onOpenSubstituteModal && onOpenSubstituteModal(scoredRecipe)}
            className="mb-4 p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] cursor-pointer hover:bg-[#FEF3C7] transition-all"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#92400E] mb-1">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Missing {missingRequired.length} Ingredient{missingRequired.length > 1 ? 's' : ''}:</span>
              </span>
              <span className="text-[10px] underline">View Substitutes 👉</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {missingRequired.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white border border-[#FDE68A] text-[11px] font-semibold text-[#B45309]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Technique Badge if present */}
        {recipe.techniques && recipe.techniques.length > 0 && onOpenTechnique && (
          <div className="mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playChime('med');
                onOpenTechnique(recipe.techniques![0]);
              }}
              className="w-full text-left p-2 rounded-xl bg-[#FDFBF7] hover:bg-[#FFF8E7] border border-[#EBDDCF] text-xs font-bold text-[#92400E] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Watch Technique Animation</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="pt-3 border-t border-[#F0E6D8] flex items-center gap-2">
        <button
          onClick={() => {
            playChime('high');
            onCookRecipe(recipe);
          }}
          className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Start Cooking</span>
        </button>

        {onQueueContinuous && (
          <button
            onClick={() => {
              playChime('high');
              onQueueContinuous(recipe);
            }}
            className="p-3 rounded-2xl bg-[#F7F3EB] hover:bg-[#EBDDCF] text-[#2D3142] transition-all cursor-pointer"
            title="Queue in Multi-Dish Stove Flow"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
