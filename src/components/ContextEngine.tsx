import React from 'react';
import {
  Sun,
  CloudRain,
  Snowflake,
  Zap,
  Heart,
  Salad,
  ChefHat,
  Clock,
  Sparkles,
  RotateCcw,
  Sliders,
  Flame
} from 'lucide-react';
import { MealSlot, Weather, Mood } from '../types';
import { playChime } from '../utils/audio';

interface ContextEngineProps {
  mealSlot: MealSlot;
  weather: Weather;
  mood: Mood;
  onSelectMealSlot: (slot: MealSlot) => void;
  onSelectWeather: (weather: Weather) => void;
  onSelectMood: (mood: Mood) => void;
  isAutoMealSlot: boolean;
  onResetAutoMealSlot: () => void;
}

const MEAL_SLOTS: {
  id: MealSlot;
  label: string;
  hindiLabel: string;
  icon: string;
  timeHint: string;
  glowColor: string;
}[] = [
  {
    id: 'Breakfast',
    label: 'Breakfast',
    hindiLabel: 'नाश्ता',
    icon: '🌅',
    timeHint: '6 AM – 11 AM',
    glowColor: 'from-[#FF7E5F] to-[#FEB47B]'
  },
  {
    id: 'Lunch',
    label: 'Lunch',
    hindiLabel: 'दोपहर का भोजन',
    icon: '☀️',
    timeHint: '11 AM – 3 PM',
    glowColor: 'from-[#F59E0B] to-[#FBBF24]'
  },
  {
    id: 'Snacks',
    label: 'Snacks / Chai',
    hindiLabel: 'शाम की चाय',
    icon: '☕',
    timeHint: '3 PM – 6 PM',
    glowColor: 'from-[#E06D53] to-[#D97706]'
  },
  {
    id: 'Dinner',
    label: 'Dinner',
    hindiLabel: 'रात का खाना',
    icon: '🌙',
    timeHint: '6 PM – 11 PM',
    glowColor: 'from-[#C84B31] to-[#E06D53]'
  },
];

const WEATHERS: {
  id: Weather;
  label: string;
  icon: string;
  hint: string;
  badge: string;
}[] = [
  {
    id: 'Sunny',
    label: 'Sunny / Hot',
    icon: '☀️',
    hint: 'Refreshing, cooling, digestive meals',
    badge: 'Cooling & Light'
  },
  {
    id: 'Rainy',
    label: 'Rainy / Cool',
    icon: '🌧️',
    hint: 'Crispy snacks, pakoras, steaming soups',
    badge: 'Crispy & Warm'
  },
  {
    id: 'Chilly',
    label: 'Chilly / Winter',
    icon: '❄️',
    hint: 'Hearty ghee flatbreads, rich curries',
    badge: 'Hearty & Rich'
  },
];

const MOODS: {
  id: Mood;
  label: string;
  icon: string;
  hint: string;
  level: string;
}[] = [
  {
    id: 'Quick',
    label: 'Quick & Easy',
    icon: '⚡',
    hint: '< 20 mins, one-pot or minimal pans',
    level: 'Level 1: Fast'
  },
  {
    id: 'Comfort',
    label: 'Comfort Food',
    icon: '🍲',
    hint: 'Warm, homely, soul-satisfying staples',
    level: 'Level 2: Homely'
  },
  {
    id: 'Healthy',
    label: 'Light & Healthy',
    icon: '🥗',
    hint: 'Low oil, iron-packed, nutritious',
    level: 'Level 3: Fit'
  },
  {
    id: 'Leisurely',
    label: 'Weekend Special',
    icon: '👩‍🍳',
    hint: 'Multi-course elaborate royal feast',
    level: 'Level 4: Feast'
  },
];

export const ContextEngine: React.FC<ContextEngineProps> = ({
  mealSlot,
  weather,
  mood,
  onSelectMealSlot,
  onSelectWeather,
  onSelectMood,
  isAutoMealSlot,
  onResetAutoMealSlot
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E8DCCF] shadow-kitchen-console relative overflow-hidden">
      {/* Top Console Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-[#F0E4D5]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E06D53]/15 text-[#E06D53] flex items-center justify-center">
            <Sliders className="w-4 h-4 text-[#E06D53]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#2D3142] font-heading tracking-wide uppercase">
              Rasoi Context Engine
            </h3>
            <p className="text-[11px] text-[#7D7065]">
              Real-time culinary matching rules for Mom's kitchen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAutoMealSlot ? (
            <span className="text-[11px] bg-[#EAF4EB] text-[#2E5E2D] font-bold px-3 py-1 rounded-full border border-[#588157]/20 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#588157] animate-pulse" />
              <span>Clock Auto-Synced</span>
            </span>
          ) : (
            <button
              onClick={onResetAutoMealSlot}
              className="text-[11px] text-[#E06D53] hover:bg-[#E06D53]/10 font-bold px-3 py-1 rounded-full border border-[#E06D53]/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Sync with Clock</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Meal Slot Flow */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-[#2D3142] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#E06D53] text-white text-[10px] font-black flex items-center justify-center">
                1
              </span>
              <span>Select Meal Slot:</span>
            </span>
            <span className="text-[11px] text-[#7D7065] font-medium hidden sm:inline">
              Adjusts recipe meal categories & prep rhythms
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {MEAL_SLOTS.map((slot) => {
              const isSelected = mealSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    playChime('med');
                    onSelectMealSlot(slot.id);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-start justify-between cursor-pointer select-none text-left relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#FFF5F1] to-[#FFF0EA] border-[#E06D53] shadow-kitchen-card ring-2 ring-[#E06D53]/20 scale-101'
                      : 'bg-[#FCFAF7] border-[#EAE0D2] text-[#2D3142] hover:bg-white hover:border-[#D4C3AE]'
                  }`}
                >
                  {/* Subtle top indicator bar */}
                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E06D53] to-[#F59E0B]" />
                  )}

                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
                      {slot.icon}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#E06D53] text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {slot.timeHint}
                    </span>
                  </div>

                  <div>
                    <p
                      className={`text-sm sm:text-base font-extrabold leading-tight font-heading ${
                        isSelected ? 'text-[#E06D53]' : 'text-[#2D3142]'
                      }`}
                    >
                      {slot.label}
                    </p>
                    <p className="text-[11px] text-[#7D7065] font-medium mt-0.5">
                      {slot.hindiLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Weather Condition Sensor */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-[#2D3142] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-black text-[10px] font-black flex items-center justify-center">
                2
              </span>
              <span>Kitchen Weather Sensor:</span>
            </span>
            <span className="text-[11px] text-[#7D7065] font-medium hidden sm:inline">
              Prioritizes seasonal craving physics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {WEATHERS.map((w) => {
              const isSelected = weather === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    playChime('med');
                    onSelectWeather(w.id);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 cursor-pointer select-none text-left relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border-[#F59E0B] shadow-kitchen-card ring-2 ring-[#F59E0B]/20 scale-101'
                      : 'bg-[#FCFAF7] border-[#EAE0D2] text-[#2D3142] hover:bg-white hover:border-[#D4C3AE]'
                  }`}
                >
                  <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs group-hover:scale-110 transition-transform shrink-0">
                    {w.icon}
                  </span>
                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs sm:text-sm font-extrabold font-heading ${
                          isSelected ? 'text-[#92400E]' : 'text-[#2D3142]'
                        }`}
                      >
                        {w.label}
                      </p>
                      <span className="text-[10px] text-gray-500 font-semibold hidden md:inline">
                        {w.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7D7065] truncate mt-0.5">
                      {w.hint}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Mom's Mood & Energy Gauge */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-[#2D3142] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#588157] text-white text-[10px] font-black flex items-center justify-center">
                3
              </span>
              <span>Mom’s Energy & Culinary Mood:</span>
            </span>
            <span className="text-[11px] text-[#7D7065] font-medium hidden sm:inline">
              Filters dishes by cooking complexity & time investment
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {MOODS.map((m) => {
              const isSelected = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    playChime('med');
                    onSelectMood(m.id);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-start justify-between cursor-pointer select-none text-left relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border-[#588157] shadow-kitchen-card ring-2 ring-[#588157]/20 scale-101'
                      : 'bg-[#FCFAF7] border-[#EAE0D2] text-[#2D3142] hover:bg-white hover:border-[#D4C3AE]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
                      {m.icon}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#588157] text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {m.level}
                    </span>
                  </div>

                  <div>
                    <p
                      className={`text-xs sm:text-sm font-extrabold font-heading ${
                        isSelected ? 'text-[#166534]' : 'text-[#2D3142]'
                      }`}
                    >
                      {m.label}
                    </p>
                    <p className="text-[10px] text-[#7D7065] line-clamp-1 mt-0.5">
                      {m.hint}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
