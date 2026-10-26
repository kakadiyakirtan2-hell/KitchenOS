import React from 'react';
import {
  ShoppingBag,
  Layers,
  Sparkles,
  Calendar,
  Volume2,
  VolumeX,
  ChefHat,
  Clock
} from 'lucide-react';
import { MealSlot } from '../types';
import { playChime, isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface NavbarProps {
  inStockCount: number;
  totalPantryCount: number;
  currentMealSlot: MealSlot;
  onOpenPantry: () => void;
  onOpenContinuousCooking: () => void;
  onOpenVideoStudio: () => void;
  onOpenJournal: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  inStockCount,
  totalPantryCount,
  currentMealSlot,
  onOpenPantry,
  onOpenContinuousCooking,
  onOpenVideoStudio,
  onOpenJournal,
  soundOn,
  onToggleSound
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EBDDCF] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E06D53] to-[#F59E0B] text-white flex items-center justify-center shadow-md shadow-[#E06D53]/20">
            <span className="text-2xl">🍲</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-[#2D3142] font-heading tracking-tight">
                Mom’s Rasoi
              </h1>
              <span className="hidden sm:inline-block bg-[#E06D53]/15 text-[#E06D53] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                Kitchen Studio
              </span>
            </div>
            <p className="text-[11px] text-[#7D7065] hidden sm:block">
              Algorithmic smart pantry cooking assistant for Mom
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Pantry Button */}
          <button
            onClick={() => {
              playChime('med');
              onOpenPantry();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-[#E8DEC8] hover:border-[#588157] text-[#2D3142] shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#588157]" />
            <span className="text-xs font-bold hidden md:inline">Pantry:</span>
            <span className="text-xs font-extrabold text-[#588157] bg-[#588157]/15 px-2 py-0.5 rounded-full">
              {inStockCount}
            </span>
          </button>

          {/* Continuous Stove Flow Button */}
          <button
            onClick={() => {
              playChime('med');
              onOpenContinuousCooking();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#E8DEC8] hover:border-[#E06D53] text-[#2D3142] shadow-xs hover:shadow-sm transition-all cursor-pointer"
            title="Multi-dish continuous stovetop flow coordinator"
          >
            <Layers className="w-4 h-4 text-[#E06D53]" />
            <span className="text-xs font-bold hidden lg:inline">Continuous Flow</span>
          </button>

          {/* Video Studio Button */}
          <button
            onClick={() => {
              playChime('med');
              onOpenVideoStudio();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-[#FFF5EE] to-[#FFF0E6] border border-[#F5D8BA] hover:border-[#E06D53] text-[#E06D53] shadow-xs hover:shadow-sm transition-all cursor-pointer"
            title="Interactive animated video demonstrations for cooking techniques"
          >
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-bold hidden sm:inline">Video Studio</span>
          </button>

          {/* Journal Button */}
          <button
            onClick={() => {
              playChime('med');
              onOpenJournal();
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white border border-[#E8DEC8] hover:border-[#2D3142] text-[#2D3142] shadow-xs transition-all cursor-pointer"
            title="Mom's Daily Meal Log & Notes"
          >
            <Calendar className="w-4 h-4 text-[#2D3142]" />
            <span className="text-xs font-bold hidden xl:inline ml-1">Diary</span>
          </button>

          {/* Audio Chimes Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-2xl bg-white border border-[#E8DEC8] hover:bg-gray-50 text-gray-500 hover:text-[#2D3142] transition-all cursor-pointer"
            title={soundOn ? 'Mute Kitchen Audio Chimes' : 'Enable Kitchen Audio Chimes'}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-[#F59E0B]" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
