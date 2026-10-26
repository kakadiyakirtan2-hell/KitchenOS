import React, { useState } from 'react';
import { X, Sparkles, ChefHat, Flame, BookOpen, Volume2, ArrowRight } from 'lucide-react';
import { TechniqueAnimation, Recipe } from '../types';
import { TECHNIQUES } from '../data/techniques';
import { TechniqueVideoCanvas } from './TechniqueVideoCanvas';
import { playChime } from '../utils/audio';

interface VideoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTechniqueId?: string | null;
  recipes: Recipe[];
  onSelectRecipe?: (recipe: Recipe) => void;
}

export const VideoStudioModal: React.FC<VideoStudioModalProps> = ({
  isOpen,
  onClose,
  initialTechniqueId,
  recipes,
  onSelectRecipe
}) => {
  const [selectedTechId, setSelectedTechId] = useState<string>(
    initialTechniqueId || TECHNIQUES[0].id
  );

  if (!isOpen) return null;

  const currentTechnique =
    TECHNIQUES.find((t) => t.id === selectedTechId) || TECHNIQUES[0];

  // Find recipes using this technique
  const relatedRecipes = recipes.filter(
    (r) => r.techniques && r.techniques.includes(currentTechnique.id)
  );

  const handleSelectTechnique = (id: string) => {
    setSelectedTechId(id);
    playChime('med');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#FDFBF7] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#EBDDCF]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
                  Mom’s Rasoi Video Studio
                </h2>
                <span className="bg-white/25 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Visual Masterclass
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90">
                Continuous video animations showing authentic kitchen physics & culinary cues
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playChime('low');
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Technique Pill Selector */}
        <div className="px-6 py-3 bg-[#F7F3EB] border-b border-[#EBDDCF] flex items-center gap-2 overflow-x-auto scrollbar-none">
          {TECHNIQUES.map((tech) => {
            const isSelected = tech.id === selectedTechId;
            return (
              <button
                key={tech.id}
                onClick={() => handleSelectTechnique(tech.id)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#E06D53] text-white shadow-md scale-102'
                    : 'bg-white text-[#2D3142]/80 hover:bg-white/80 border border-[#E8DEC8]'
                }`}
              >
                <span>{tech.title}</span>
                {isSelected && <Sparkles className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Modal Body: Split 2 columns on desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#FDFBF7]">
          {/* Left Column: Interactive Video Player (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <TechniqueVideoCanvas key={currentTechnique.id} technique={currentTechnique} autoPlay={true} />

            {/* Visual Cue Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF9F2] to-[#FFF3E8] border border-[#F5D8BA] flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#F59E0B]/20 text-[#D97706] shrink-0 mt-0.5">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#8C3A00] font-heading">
                  Mom's Secret Visual Cue:
                </h4>
                <p className="text-xs sm:text-sm text-[#5C3B1E] mt-0.5 leading-relaxed">
                  {currentTechnique.visualCue}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Culinary Secrets & Recipe Links (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Header info */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E06D53]">
                {currentTechnique.category}
              </span>
              <h3 className="text-xl font-bold text-[#2D3142] font-heading mt-0.5">
                {currentTechnique.title}
              </h3>
              <p className="text-sm font-medium text-[#7D7065] italic">
                {currentTechnique.hindiTitle}
              </p>
              <p className="text-xs sm:text-sm text-[#4A4E69] mt-2 leading-relaxed">
                {currentTechnique.description}
              </p>
            </div>

            {/* Key Chef Tips */}
            <div className="bg-white rounded-2xl p-4 border border-[#EBDDCF] shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D3142] mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>4 Golden Rules for Mom:</span>
              </h4>
              <ul className="space-y-2">
                {currentTechnique.keyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#4A4E69]">
                    <span className="w-5 h-5 rounded-full bg-[#E06D53]/15 text-[#E06D53] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dishes using this technique */}
            {relatedRecipes.length > 0 && (
              <div className="bg-[#F7F3EB] rounded-2xl p-4 border border-[#EBDDCF]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D3142] mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#588157]" />
                  <span>Recipes Using This Technique:</span>
                </h4>
                <div className="flex flex-col gap-2">
                  {relatedRecipes.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E8DEC8] hover:border-[#E06D53] transition-all group cursor-pointer"
                      onClick={() => {
                        playChime('high');
                        onClose();
                        if (onSelectRecipe) onSelectRecipe(rec);
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{rec.emoji || '🍲'}</span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-[#2D3142] group-hover:text-[#E06D53] transition-colors">
                            {rec.title}
                          </p>
                          <p className="text-[11px] text-[#7D7065]">
                            {rec.prepTime + rec.cookTime} mins • {rec.cuisine}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#A89F91] group-hover:text-[#E06D53] group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
