import React from 'react';
import {
  Clock,
  Users,
  AlertCircle,
  Play,
  Layers,
  Sparkles,
  Heart,
  ChefHat,
  ChevronRight,
  Flame
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
  const { recipe, baseScore, finalScore, tier, missingRequired } = scoredRecipe;

  const totalTime = recipe.prepTime + recipe.cookTime;

  // Tier configuration
  const tierConfig = {
    ready: {
      badge: '🟢 Ready to Cook!',
      badgeClass: 'bg-[#EBF5EE] text-[#1E5224] border-[#588157]/30',
      ringColor: '#588157',
      cardBorder: 'border-[#588157]/40 hover:border-[#588157]',
      glow: 'shadow-kitchen-card hover:shadow-kitchen-lg'
    },
    'missing-few': {
      badge: `🟡 Missing ${missingRequired.length} Item${missingRequired.length > 1 ? 's' : ''}`,
      badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B]/30',
      ringColor: '#F59E0B',
      cardBorder: 'border-[#F59E0B]/40 hover:border-[#F59E0B]',
      glow: 'shadow-kitchen-card hover:shadow-kitchen-lg'
    },
    explore: {
      badge: '⚪ Explore Dish',
      badgeClass: 'bg-gray-100 text-[#4A4E69] border-gray-200',
      ringColor: '#A89F91',
      cardBorder: 'border-[#EAE0D2] hover:border-[#E06D53]',
      glow: 'shadow-kitchen-card hover:shadow-kitchen'
    }
  }[tier];

  // Derive spice level
  const spicePills = recipe.tags.some((t) => t.toLowerCase().includes('spicy') || t.toLowerCase().includes('street'))
    ? '🌶️🌶️ Spicy'
    : '🌶️ Homestyle';

  return (
    <div
      className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all flex flex-col justify-between relative group ${tierConfig.cardBorder} ${tierConfig.glow}`}
    >
      <div>
        {/* Top Header: Floating Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 shadow-2xs ${tierConfig.badgeClass}`}
            >
              <span>{tierConfig.badge}</span>
            </span>

            {recipe.tags.includes('Freshly Created') && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-[#FFF5DC] to-[#FFEFE2] text-[#9A4600] border border-[#F5D4B2] flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                <span>✨ Freshly Created for You</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Radial Match Score Ring */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FCFAF7] border border-[#EAE0D2] shadow-2xs"
              title={`Base: ${baseScore}% + Context Match`}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg className="w-5 h-5 transform -rotate-90">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="#EFE8DD"
                    strokeWidth="2.5"
                    fill="transparent"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke={tierConfig.ringColor}
                    strokeWidth="2.5"
                    strokeDasharray={50}
                    strokeDashoffset={50 - (50 * finalScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
              </div>
              <span className="text-xs font-black font-mono text-[#2D3142]">
                {finalScore}%
              </span>
            </div>

            {/* Favorite Bookmark */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playChime('high');
                  onToggleFavorite(recipe.id);
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isFavorite
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'text-gray-300 hover:text-red-400 bg-gray-50'
                }`}
                title="Add to Mom's Favorites"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Dish Title & 3D Culinary Icon */}
        <div className="flex items-start gap-3.5 mb-2.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FFF7EE] to-[#FFF0E2] border border-[#F5DCBE] flex items-center justify-center text-3xl shadow-kitchen-card shrink-0 group-hover:scale-105 transition-transform">
            <span>{recipe.emoji || '🍲'}</span>
          </div>

          <div className="flex-1 truncate">
            <h3 className="text-base sm:text-lg font-extrabold text-[#2D3142] font-heading group-hover:text-[#E06D53] transition-colors leading-snug">
              {recipe.title}
            </h3>
            {recipe.hindiTitle && (
              <p className="text-xs font-semibold text-[#8C7A6B]">
                {recipe.hindiTitle}
              </p>
            )}
            <span className="inline-block text-[10px] font-bold text-[#E06D53] uppercase tracking-wider mt-0.5">
              {recipe.cuisine}
            </span>
          </div>
        </div>

        {/* Short Homestyle Description */}
        <p className="text-xs text-[#52576B] line-clamp-2 leading-relaxed mb-3.5">
          {recipe.description}
        </p>

        {/* Tactile Meta Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#7D7065] font-semibold mb-4">
          <span className="flex items-center gap-1 bg-[#F7F3EB] px-2.5 py-1 rounded-xl border border-[#EBE1D3]">
            <Clock className="w-3.5 h-3.5 text-[#E06D53]" />
            <span>{totalTime} mins</span>
          </span>
          <span className="flex items-center gap-1 bg-[#F7F3EB] px-2.5 py-1 rounded-xl border border-[#EBE1D3]">
            <Users className="w-3.5 h-3.5 text-[#588157]" />
            <span>{recipe.servings} Servings</span>
          </span>
          <span className="bg-[#F7F3EB] px-2.5 py-1 rounded-xl border border-[#EBE1D3] text-[#7D7065]">
            {spicePills}
          </span>
        </div>

        {/* Missing Ingredients Rescue Pill with Substitution Modal Trigger */}
        {tier === 'missing-few' && missingRequired.length > 0 && (
          <div
            onClick={() => onOpenSubstituteModal && onOpenSubstituteModal(scoredRecipe)}
            className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border border-[#FDE68A] cursor-pointer hover:border-[#F59E0B] transition-all group/sub"
          >
            <div className="flex items-center justify-between text-xs font-black text-[#92400E] mb-1.5">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Missing: {missingRequired.join(', ')}</span>
              </span>
              <span className="text-[10px] text-[#B45309] underline group-hover/sub:text-[#92400E]">
                Substitute 👉
              </span>
            </div>
            <p className="text-[11px] text-[#78350F] leading-snug">
              💡 Mom, tap here to view quick alternatives from your kitchen shelves!
            </p>
          </div>
        )}

        {/* Video Technique Animation Pill */}
        {recipe.techniques && recipe.techniques.length > 0 && onOpenTechnique && (
          <div className="mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playChime('med');
                onOpenTechnique(recipe.techniques![0]);
              }}
              className="w-full text-left p-2.5 rounded-2xl bg-[#FFF9F2] hover:bg-[#FFF3E5] border border-[#F5DECA] text-xs font-black text-[#9A4600] flex items-center justify-between transition-colors cursor-pointer group/vid"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] group-hover/vid:rotate-12 transition-transform" />
                <span>Watch Technique Animation</span>
              </span>
              <ChevronRight className="w-4 h-4 text-[#D97706] group-hover/vid:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="pt-3.5 border-t border-[#F2E8DC] flex items-center gap-2">
        <button
          onClick={() => {
            playChime('high');
            onCookRecipe(recipe);
          }}
          className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-kitchen-button hover:brightness-105 active:scale-98 transition-all cursor-pointer"
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
            className="p-3 rounded-2xl bg-[#F7F3EB] hover:bg-[#EBE1D3] text-[#2D3142] border border-[#E4D7C5] transition-all cursor-pointer"
            title="Queue in Multi-Dish Stove Flow"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
