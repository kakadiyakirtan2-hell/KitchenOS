import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Layers,
  Sparkles,
  Calendar,
  Volume2,
  VolumeX,
  Flame,
  Clock,
  ChefHat,
  Globe
} from 'lucide-react';
import { MealSlot } from '../types';
import { playChime } from '../utils/audio';
import { Language, LANGUAGES, getTranslation } from '../utils/translations';

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
  activeStoveCount?: number;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
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
  onToggleSound,
  activeStoveCount = 0,
  currentLanguage,
  onSelectLanguage
}) => {
  // Live clock
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass-kitchen border-b border-[#EADFCF]/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Left: Brand & Live Appliance Status */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={onOpenContinuousCooking}>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#E06D53] via-[#E87A62] to-[#F59E0B] text-white flex items-center justify-center shadow-kitchen-button transform group-hover:scale-105 transition-all">
              <span className="text-2xl animate-gentle-float">🍲</span>
            </div>
            {/* Live flame dot on icon */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-[#2D3142] font-heading tracking-tight flex items-center gap-1.5">
                <span>{getTranslation('appTitle', currentLanguage)}</span>
                <span className="text-[10px] font-bold tracking-widest text-[#E06D53] uppercase bg-[#E06D53]/10 px-2 py-0.5 rounded-md border border-[#E06D53]/20">
                  OS 2.0
                </span>
              </h1>
            </div>

            {/* Live Appliance Meter Status */}
            <div className="flex items-center gap-2 text-[11px] text-[#7D7065] font-medium">
              <span className="flex items-center gap-1 text-[#2D3142] font-semibold">
                <Clock className="w-3 h-3 text-[#E06D53]" />
                <span>{timeStr || 'LIVE'}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-[#588157] font-bold">
                {currentMealSlot.toUpperCase()} READY
              </span>
            </div>
          </div>
        </div>

        {/* Right: Tactile Quick-Action Console Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher: English, Hindi, Gujarati */}
          <div className="flex items-center bg-[#F4EFE6] p-0.5 rounded-2xl border border-[#DECDB8] shadow-2xs">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  playChime('med');
                  onSelectLanguage(l.code);
                }}
                className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentLanguage === l.code
                    ? 'bg-[#E06D53] text-white shadow-xs'
                    : 'text-[#7D7065] hover:text-[#2D3142] hover:bg-white/60'
                }`}
                title={`${l.label} (${l.nativeName})`}
              >
                <span>{l.short}</span>
              </button>
            ))}
          </div>

          {/* Smart Pantry Button with Glowing Count */}
          <button
            onClick={() => {
              playChime('med');
              onOpenPantry();
            }}
            className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl bg-white border border-[#E4D7C5] hover:border-[#588157] text-[#2D3142] shadow-xs hover:shadow-kitchen transition-all cursor-pointer group"
          >
            <div className="p-1 rounded-lg bg-[#588157]/10 text-[#588157] group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-left hidden md:block leading-tight">
              <p className="text-[10px] text-[#7D7065] font-medium">{getTranslation('stockLabel', currentLanguage)}</p>
              <p className="text-xs font-extrabold text-[#2D3142]">{getTranslation('pantryStock', currentLanguage)}</p>
            </div>
            <span className="text-xs font-black text-[#2E5E2D] bg-[#EAF4EB] px-2 py-0.5 rounded-full border border-[#588157]/20 shadow-2xs">
              {inStockCount}
            </span>
          </button>

          {/* Continuous Multi-Dish Stove Flow */}
          <button
            onClick={() => {
              playChime('med');
              onOpenContinuousCooking();
            }}
            className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl bg-white border border-[#E4D7C5] hover:border-[#E06D53] text-[#2D3142] shadow-xs hover:shadow-kitchen transition-all cursor-pointer group"
            title="Multi-Dish Simultaneous Stovetop Flow"
          >
            <div className="p-1 rounded-lg bg-[#E06D53]/10 text-[#E06D53] group-hover:scale-110 transition-transform">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E06D53]" />
            </div>
            <div className="text-left hidden lg:block leading-tight">
              <p className="text-[10px] text-[#7D7065] font-medium">{getTranslation('threeBurner', currentLanguage)}</p>
              <p className="text-xs font-extrabold text-[#2D3142]">{getTranslation('stoveFlow', currentLanguage)}</p>
            </div>
          </button>

          {/* Video Studio Button with Golden Shimmer */}
          <button
            onClick={() => {
              playChime('med');
              onOpenVideoStudio();
            }}
            className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-[#FFF5EC] to-[#FEF3E2] border border-[#F5D4B2] hover:border-[#E06D53] text-[#9A4600] shadow-xs hover:shadow-kitchen transition-all cursor-pointer group"
            title="Interactive Cooking Video Demonstrations"
          >
            <Sparkles className="w-4 h-4 text-[#F59E0B] group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-extrabold hidden sm:inline">
              {getTranslation('videoStudio', currentLanguage)}
            </span>
          </button>

          {/* Meal Journal & Notes */}
          <button
            onClick={() => {
              playChime('med');
              onOpenJournal();
            }}
            className="p-2 sm:p-2.5 rounded-2xl bg-white border border-[#E4D7C5] hover:border-[#2D3142] text-[#2D3142] shadow-xs transition-all cursor-pointer"
            title="Mom's Daily Meal Log & Secret Notes"
          >
            <Calendar className="w-4 h-4 text-[#2D3142]" />
          </button>

          {/* Audio Chimes Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 sm:p-2.5 rounded-2xl bg-white border border-[#E4D7C5] hover:bg-gray-50 text-gray-500 hover:text-[#2D3142] transition-all cursor-pointer"
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
