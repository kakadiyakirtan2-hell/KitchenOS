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
  RotateCcw
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

const MEAL_SLOTS: { id: MealSlot; label: string; icon: string; timeHint: string }[] = [
  { id: 'Breakfast', label: 'Breakfast', icon: '🌅', timeHint: '6 AM - 11 AM' },
  { id: 'Lunch', label: 'Lunch', icon: '☀️', timeHint: '11 AM - 3 PM' },
  { id: 'Snacks', label: 'Snacks / Chai', icon: '☕', timeHint: '3 PM - 6 PM' },
  { id: 'Dinner', label: 'Dinner', icon: '🌙', timeHint: '6 PM - 11 PM' },
];

const WEATHERS: { id: Weather; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: 'Sunny', label: 'Sunny / Hot', icon: <Sun className="w-4 h-4 text-amber-500" />, hint: 'Cooling & light dishes' },
  { id: 'Rainy', label: 'Rainy / Cool', icon: <CloudRain className="w-4 h-4 text-blue-500" />, hint: 'Crispy pakoras & soups' },
  { id: 'Chilly', label: 'Chilly / Winter', icon: <Snowflake className="w-4 h-4 text-cyan-500" />, hint: 'Hearty parathas & stews' },
];

const MOODS: { id: Mood; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: 'Quick', label: 'Quick & Easy', icon: <Zap className="w-4 h-4 text-yellow-500" />, hint: '< 20 mins, minimal pots' },
  { id: 'Comfort', label: 'Comfort Food', icon: <Heart className="w-4 h-4 text-rose-500" />, hint: 'Warm, soul-satisfying' },
  { id: 'Healthy', label: 'Light & Healthy', icon: <Salad className="w-4 h-4 text-emerald-500" />, hint: 'Nutritious & low oil' },
  { id: 'Leisurely', label: 'Weekend Special', icon: <ChefHat className="w-4 h-4 text-amber-600" />, hint: 'Elaborate festive feasts' },
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
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#EBDDCF] shadow-kitchen flex flex-col gap-5">
      {/* 1. Meal Slot Pill Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#E06D53]/15 text-[#E06D53] font-bold text-xs flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-bold text-[#2D3142] uppercase tracking-wider">
              Meal Time Slot:
            </span>
            {isAutoMealSlot ? (
              <span className="text-[10px] bg-[#588157]/15 text-[#588157] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Clock Auto-Synced</span>
              </span>
            ) : (
              <button
                onClick={onResetAutoMealSlot}
                className="text-[10px] text-[#E06D53] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                title="Reset to current clock time"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Clock</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MEAL_SLOTS.map((slot) => {
            const isSelected = mealSlot === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => {
                  playChime('med');
                  onSelectMealSlot(slot.id);
                }}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#FFF5F1] to-[#FFEFEA] border-[#E06D53] text-[#E06D53] shadow-xs'
                    : 'bg-[#FDFBF7] border-[#E8DEC8] text-[#2D3142] hover:bg-white'
                }`}
              >
                <span className="text-xl">{slot.icon}</span>
                <span className="text-xs sm:text-sm font-bold">{slot.label}</span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {slot.timeHint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Weather Selector */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#D97706] font-bold text-xs flex items-center justify-center">
            2
          </span>
          <span className="text-xs font-bold text-[#2D3142] uppercase tracking-wider">
            Current Weather Condition:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {WEATHERS.map((w) => {
            const isSelected = weather === w.id;
            return (
              <button
                key={w.id}
                onClick={() => {
                  playChime('med');
                  onSelectWeather(w.id);
                }}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer select-none active:scale-95 text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border-[#F59E0B] text-[#92400E] shadow-xs'
                    : 'bg-[#FDFBF7] border-[#E8DEC8] text-[#2D3142] hover:bg-white'
                }`}
              >
                <div className="p-2 rounded-xl bg-white shadow-xs shrink-0">
                  {w.icon}
                </div>
                <div className="truncate">
                  <p className="text-xs sm:text-sm font-bold truncate">{w.label}</p>
                  <p className="text-[11px] text-gray-500 truncate">{w.hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Mom's Mood & Energy Meter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-[#588157]/20 text-[#588157] font-bold text-xs flex items-center justify-center">
            3
          </span>
          <span className="text-xs font-bold text-[#2D3142] uppercase tracking-wider">
            Mom’s Current Mood & Energy:
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOODS.map((m) => {
            const isSelected = mood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  playChime('med');
                  onSelectMood(m.id);
                }}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 text-center ${
                  isSelected
                    ? 'bg-[#F0FDF4] border-[#588157] text-[#166534] shadow-xs'
                    : 'bg-[#FDFBF7] border-[#E8DEC8] text-[#2D3142] hover:bg-white'
                }`}
              >
                <div className="p-1.5 rounded-xl bg-white shadow-xs">{m.icon}</div>
                <span className="text-xs font-bold">{m.label}</span>
                <span className="text-[10px] text-gray-500">{m.hint}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
