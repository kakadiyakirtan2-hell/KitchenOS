import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  Layers,
  Heart,
  Clock,
  RotateCcw,
  ChefHat,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  PantryItem,
  Recipe,
  MealSlot,
  Weather,
  Mood,
  ScoredRecipe,
  MealJournalEntry,
  RecipeNote,
  IngredientCategory,
  MatchTier
} from './types';
import { RECIPES } from './data/recipes';
import { DEFAULT_PANTRY_ITEMS } from './data/pantryDefaults';
import {
  scoreAndRankRecipes,
  detectAutoMealSlot
} from './utils/scoring';
import {
  loadPantry,
  savePantry,
  loadJournal,
  saveJournal,
  loadNotes,
  saveNotes,
  loadContext,
  saveContext
} from './utils/storage';
import {
  playChime,
  isSoundEnabled,
  setSoundEnabled
} from './utils/audio';

import { Navbar } from './components/Navbar';
import { ContextEngine } from './components/ContextEngine';
import { RecipeCard } from './components/RecipeCard';
import { PantryDrawer } from './components/PantryDrawer';
import { CookingModeModal } from './components/CookingModeModal';
import { ContinuousCookingModal } from './components/ContinuousCookingModal';
import { VideoStudioModal } from './components/VideoStudioModal';
import { MealJournalModal } from './components/MealJournalModal';
import { SubstituteModal } from './components/SubstituteModal';
import { AskChefMomBar } from './components/AskChefMomBar';
import {
  generateRecipesWithGemini,
  loadSavedCustomRecipes,
  saveCustomRecipe,
  deleteCustomRecipe,
  filterNewUniqueRecipes
} from './services/geminiService';
import {
  Language,
  loadSavedLanguage,
  saveLanguage,
  getTranslation
} from './utils/translations';
import confetti from 'canvas-confetti';

// Essential staples for the quick-tap pantry rack on the home screen
const QUICK_PANTRY_ITEMS = [
  { id: 'potato', name: 'Potato', icon: '🥔' },
  { id: 'onion', name: 'Onion', icon: '🧅' },
  { id: 'tomato', name: 'Tomato', icon: '🍅' },
  { id: 'paneer', name: 'Paneer', icon: '🧀' },
  { id: 'rice', name: 'Rice', icon: '🍚' },
  { id: 'atta', name: 'Atta', icon: '🌾' },
  { id: 'ghee', name: 'Ghee', icon: '🧈' },
  { id: 'curd', name: 'Curd', icon: '🥣' },
  { id: 'green-chili', name: 'Chili', icon: '🌶️' },
  { id: 'coriander', name: 'Coriander', icon: '🌿' },
  { id: 'moong-dal', name: 'Moong Dal', icon: '🍲' },
  { id: 'bread', name: 'Bread', icon: '🍞' },
];

const CUISINES = [
  'All',
  'Punjabi',
  'Gujarati',
  'South Indian',
  'Maharashtrian',
  'Rajasthani',
  'Bihari',
  'Bengali',
  'Kerala',
  'Kashmiri',
  'Odia',
  'Street Food',
  'Mithai'
];

export function App() {
  // 1. Persistent Pantry & User Data
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => loadPantry());
  const [journalEntries, setJournalEntries] = useState<MealJournalEntry[]>(() => loadJournal());
  const [recipeNotes, setRecipeNotes] = useState<Record<string, RecipeNote>>(() => loadNotes());
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() => loadSavedCustomRecipes());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>(() => loadSavedLanguage());

  // 2. Context Engine Settings
  const initialContext = useMemo(() => loadContext(), []);
  const [isAutoMealSlot, setIsAutoMealSlot] = useState<boolean>(
    initialContext?.autoMealSlotEnabled ?? true
  );
  const [mealSlot, setMealSlot] = useState<MealSlot>(() => {
    if (initialContext?.autoMealSlotEnabled !== false) {
      return detectAutoMealSlot();
    }
    return initialContext?.mealSlot || detectAutoMealSlot();
  });
  const [weather, setWeather] = useState<Weather>(initialContext?.weather || 'Sunny');
  const [mood, setMood] = useState<Mood>(initialContext?.mood || 'Quick');

  // 3. UI Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<MatchTier | 'all'>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [maxTimeFilter, setMaxTimeFilter] = useState<number>(60);
  const [onlyCurrentMealSlot, setOnlyCurrentMealSlot] = useState(true);

  // 4. Modals State
  const [isPantryOpen, setIsPantryOpen] = useState(false);
  const [isContinuousCookingOpen, setIsContinuousCookingOpen] = useState(false);
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [videoStudioInitialId, setVideoStudioInitialId] = useState<string | null>(null);

  // Active cooking recipe
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);
  const [substituteModalScored, setSubstituteModalScored] = useState<ScoredRecipe | null>(null);
  const [continuousInitialRecipes, setContinuousInitialRecipes] = useState<Recipe[]>([]);

  // Sound FX toggle
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Auto-sync meal slot periodically every 10 minutes if auto enabled
  useEffect(() => {
    if (!isAutoMealSlot) return;
    const interval = setInterval(() => {
      setMealSlot(detectAutoMealSlot());
    }, 600000);
    return () => clearInterval(interval);
  }, [isAutoMealSlot]);

  // Sync pantry to localStorage
  useEffect(() => {
    savePantry(pantryItems);
  }, [pantryItems]);

  // Sync journal to localStorage
  useEffect(() => {
    saveJournal(journalEntries);
  }, [journalEntries]);

  // Sync notes to localStorage
  useEffect(() => {
    saveNotes(recipeNotes);
  }, [recipeNotes]);

  // Sync context to localStorage
  useEffect(() => {
    saveContext({
      mealSlot,
      weather,
      mood,
      autoMealSlotEnabled: isAutoMealSlot
    });
  }, [mealSlot, weather, mood, isAutoMealSlot]);

  // 5. Rule-Based Scoring Engine
  const allAvailableRecipes = useMemo(() => {
    return [...customRecipes, ...RECIPES];
  }, [customRecipes]);

  const rankedRecipes = useMemo(() => {
    return scoreAndRankRecipes(allAvailableRecipes, pantryItems, mealSlot, weather, mood);
  }, [allAvailableRecipes, pantryItems, mealSlot, weather, mood]);

  // Context-aware recipes (filtered strictly by current meal slot if strict mode is active)
  const activeContextRecipes = useMemo(() => {
    if (onlyCurrentMealSlot) {
      const inSlot = rankedRecipes.filter((r) => r.recipe.mealSlot.includes(mealSlot));
      return inSlot.length > 0 ? inSlot : rankedRecipes;
    }
    return rankedRecipes;
  }, [rankedRecipes, onlyCurrentMealSlot, mealSlot]);

  // Tier counts strictly for active context
  const readyCount = useMemo(
    () => activeContextRecipes.filter((r) => r.tier === 'ready').length,
    [activeContextRecipes]
  );
  const missingCount = useMemo(
    () => activeContextRecipes.filter((r) => r.tier === 'missing-few').length,
    [activeContextRecipes]
  );
  const exploreCount = useMemo(
    () => activeContextRecipes.filter((r) => r.tier === 'explore').length,
    [activeContextRecipes]
  );

  // Spotlight Recipe (Top scored dish for active context)
  const spotlightRecipe = useMemo(() => {
    return activeContextRecipes[0] || null;
  }, [activeContextRecipes]);

  // Filtered recipes
  const displayedRecipes = useMemo(() => {
    return activeContextRecipes.filter((item) => {
      // Tier filter
      if (tierFilter !== 'all' && item.tier !== tierFilter) return false;

      // Cuisine filter
      if (selectedCuisine !== 'All') {
        const cLower = selectedCuisine.toLowerCase();
        if (!item.recipe.cuisine.toLowerCase().includes(cLower)) {
          return false;
        }
      }

      // Max time filter
      const totalMins = item.recipe.prepTime + item.recipe.cookTime;
      if (totalMins > maxTimeFilter) return false;

      // Favorites filter
      if (onlyFavorites) {
        const isFav = recipeNotes[item.recipe.id]?.isFavorite;
        if (!isFav) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.recipe.title.toLowerCase().includes(q);
        const matchesHindi =
          item.recipe.hindiTitle && item.recipe.hindiTitle.toLowerCase().includes(q);
        const matchesIng = item.recipe.ingredients.some((i) =>
          i.name.toLowerCase().includes(q)
        );
        const matchesCuisine = item.recipe.cuisine.toLowerCase().includes(q);
        return matchesTitle || matchesHindi || matchesIng || matchesCuisine;
      }

      return true;
    });
  }, [
    activeContextRecipes,
    tierFilter,
    selectedCuisine,
    maxTimeFilter,
    onlyFavorites,
    searchQuery,
    recipeNotes
  ]);

  const readyDishes = useMemo(
    () => displayedRecipes.filter((r) => r.tier === 'ready'),
    [displayedRecipes]
  );
  const missingDishes = useMemo(
    () => displayedRecipes.filter((r) => r.tier === 'missing-few'),
    [displayedRecipes]
  );
  const exploreDishes = useMemo(
    () => displayedRecipes.filter((r) => r.tier === 'explore'),
    [displayedRecipes]
  );

  // Pantry handlers
  const handleTogglePantryItem = (id: string) => {
    setPantryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
  };

  const handleAddPantryItem = (item: PantryItem) => {
    setPantryItems((prev) => [item, ...prev]);
  };

  const handleRemovePantryItem = (id: string) => {
    setPantryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetDefaults = () => {
    playChime('med');
    setPantryItems(DEFAULT_PANTRY_ITEMS);
  };

  const handleSelectAllCategory = (category: IngredientCategory | 'all', inStock: boolean) => {
    playChime('med');
    setPantryItems((prev) =>
      prev.map((item) => {
        if (category === 'all' || item.category === category) {
          return { ...item, inStock };
        }
        return item;
      })
    );
  };

  const handleMarkItemInStockByName = (ingredientName: string) => {
    setPantryItems((prev) => {
      const match = prev.find(
        (i) => i.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
               ingredientName.toLowerCase().includes(i.name.toLowerCase())
      );
      if (match) {
        return prev.map((item) =>
          item.id === match.id ? { ...item, inStock: true } : item
        );
      }
      const newItem: PantryItem = {
        id: `custom-${Date.now()}`,
        name: ingredientName,
        category: 'veggies',
        inStock: true,
        isCustom: true,
        icon: '✨'
      };
      return [newItem, ...prev];
    });
  };

  // Cooking & Journal Handlers
  const handleStartCooking = (recipe: Recipe) => {
    setActiveCookingRecipe(recipe);
  };

  const handleQueueContinuous = (recipe: Recipe) => {
    setContinuousInitialRecipes([recipe]);
    setIsContinuousCookingOpen(true);
  };

  const handleOpenTechniqueVideo = (techniqueId: string) => {
    setVideoStudioInitialId(techniqueId);
    setIsVideoStudioOpen(true);
  };

  const handleToggleFavorite = (recipeId: string) => {
    setRecipeNotes((prev) => {
      const existing = prev[recipeId] || {
        recipeId,
        note: '',
        rating: 5,
        isFavorite: false
      };
      return {
        ...prev,
        [recipeId]: {
          ...existing,
          isFavorite: !existing.isFavorite
        }
      };
    });
  };

  const handleSaveRecipeNote = (note: RecipeNote) => {
    setRecipeNotes((prev) => ({
      ...prev,
      [note.recipeId]: note
    }));
  };

  const handleLogCookedMeal = (entry: Omit<MealJournalEntry, 'id' | 'timestamp'>) => {
    const fullEntry: MealJournalEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      timestamp: Date.now()
    };
    setJournalEntries((prev) => [fullEntry, ...prev]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    playChime('low');
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Dynamic Custom Recipe Generation via Gemini
  const handleGenerateCustomDishes = async (craving: string, servings: number) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const inStockNames = pantryItems.filter((i) => i.inStock).map((i) => i.name);
      const existingTitles = [...customRecipes, ...RECIPES].map((r) => r.title);

      const generated = await generateRecipesWithGemini({
        pantry: inStockNames,
        servings,
        mealSlot,
        weather,
        mood,
        extraNotes: craving,
        existingTitles,
      });

      // Strictly filter out any duplicates against existing customRecipes and built-in recipes
      const uniqueNewRecipes = filterNewUniqueRecipes(generated, [...customRecipes, ...RECIPES]);

      if (uniqueNewRecipes && uniqueNewRecipes.length > 0) {
        // Persist only truly unique dishes
        uniqueNewRecipes.forEach((r) => saveCustomRecipe(r));
        setCustomRecipes((prev) => [...uniqueNewRecipes, ...prev]);

        // Reset active filters so user immediately sees the new dishes
        setTierFilter('all');
        setSelectedCuisine('All');
        setSearchQuery('');
        setOnlyFavorites(false);

        playChime('high');
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E06D53', '#F59E0B', '#588157']
        });
      } else if (generated && generated.length > 0) {
        setGenerationError("Chef Mom generated recipes for this craving, but they are already in your kitchen collection! Check the recipes below.");
      } else {
        setGenerationError("Couldn't generate dishes this time. Try tapping a few pantry staples or giving a different craving!");
      }
    } catch (err: any) {
      console.error('Error generating custom dishes:', err);
      setGenerationError(err?.message || 'Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCustomRecipe = (recipeId: string) => {
    playChime('low');
    const updated = deleteCustomRecipe(recipeId);
    setCustomRecipes(updated);
  };

  const inStockPantryCount = pantryItems.filter((i) => i.inStock).length;

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-[#2D3142] flex flex-col selection:bg-[#E06D53]/20 selection:text-[#E06D53]">
      {/* 1. Header Navigation Bar */}
      <Navbar
        inStockCount={inStockPantryCount}
        totalPantryCount={pantryItems.length}
        currentMealSlot={mealSlot}
        onOpenPantry={() => setIsPantryOpen(true)}
        onOpenContinuousCooking={() => setIsContinuousCookingOpen(true)}
        onOpenVideoStudio={() => {
          setVideoStudioInitialId(null);
          setIsVideoStudioOpen(true);
        }}
        onOpenJournal={() => setIsJournalOpen(true)}
        soundOn={soundOn}
        onToggleSound={() => {
          const next = !soundOn;
          setSoundOn(next);
          setSoundEnabled(next);
        }}
        currentLanguage={language}
        onSelectLanguage={(lang) => {
          setLanguage(lang);
          saveLanguage(lang);
        }}
      />

      {/* 2. Hero Warm Kitchen Studio Banner with Ambient Glow */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F3EADF] via-[#F8F2E9] to-[#FAF6EF] border-b border-[#E8DCCF] pt-6 pb-8 px-4 sm:px-6">
        {/* Soft ambient lighting orb */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#E06D53]/15 to-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E4D7C5] shadow-2xs mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E06D53] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#E06D53]">
                {getTranslation('consoleBadge', language)}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-[11px] text-[#7D7065] font-bold">
                {getTranslation('algorithmicMatcher', language)}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3142] font-heading tracking-tight leading-tight">
              {getTranslation('heroQuestion', language)}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E06D53] via-[#E87A62] to-[#F59E0B]">
                {getTranslation('heroRightNow', language)}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7065] mt-1.5 max-w-2xl leading-relaxed">
              {getTranslation('heroSubtitle', language)}
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-2.5 rounded-3xl border border-[#E4D7C5] shadow-kitchen">
            <div className="px-4 py-2 bg-[#EBF5EE] rounded-2xl border border-[#588157]/20 text-center">
              <p className="text-[10px] font-black text-[#1E5224] uppercase">{getTranslation('readyNow', language)}</p>
              <p className="text-xl font-black text-[#2E5E2D] font-mono">{readyCount}</p>
            </div>
            <div className="px-4 py-2 bg-[#FFFBEB] rounded-2xl border border-[#F59E0B]/20 text-center">
              <p className="text-[10px] font-black text-[#92400E] uppercase">{getTranslation('missingFew', language)}</p>
              <p className="text-xl font-black text-[#B45309] font-mono">{missingCount}</p>
            </div>
            <div className="px-4 py-2 bg-[#F7F3EB] rounded-2xl border border-[#E8DEC8] text-center">
              <p className="text-[10px] font-black text-[#7D7065] uppercase">{getTranslation('inStock', language)}</p>
              <p className="text-xl font-black text-[#2D3142] font-mono">{inStockPantryCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8 w-full">
        {/* Context Engine Controls (Feature B) */}
        <ContextEngine
          mealSlot={mealSlot}
          weather={weather}
          mood={mood}
          onSelectMealSlot={(slot) => {
            setMealSlot(slot);
            setIsAutoMealSlot(false);
          }}
          onSelectWeather={(w) => setWeather(w)}
          onSelectMood={(m) => setMood(m)}
          isAutoMealSlot={isAutoMealSlot}
          onResetAutoMealSlot={() => {
            playChime('med');
            setIsAutoMealSlot(true);
            setMealSlot(detectAutoMealSlot());
          }}
        />

        {/* Live Active Context Bar */}
        <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FDF7EE] to-[#FFFBF5] border-2 border-[#F3DFCD] rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-kitchen">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E06D53] to-[#F59E0B] text-white flex items-center justify-center text-xl shadow-md shrink-0">
              {mealSlot === 'Breakfast' ? '🌅' : mealSlot === 'Lunch' ? '☀️' : mealSlot === 'Snacks' ? '☕' : '🌙'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E06D53] bg-[#E06D53]/10 px-2.5 py-0.5 rounded-full border border-[#E06D53]/20">
                  Live Kitchen Tuning
                </span>
                <span className="text-xs sm:text-sm font-black text-[#2D3142] font-heading">
                  {mealSlot === 'Snacks' ? '☕ Snacks / Chai Time' : mealSlot === 'Breakfast' ? '🌅 Morning Breakfast' : mealSlot === 'Lunch' ? '☀️ Afternoon Lunch' : '🌙 Evening Dinner'}
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="text-xs text-[#7D7065] font-bold">
                  {weather === 'Rainy' ? '🌧️ Rainy / Cool (Crispy & Warm)' : weather === 'Sunny' ? '☀️ Sunny / Hot (Light & Cooling)' : '❄️ Chilly Winter (Hearty & Rich)'}
                </span>
              </div>
              <p className="text-[11px] text-[#7D7065] mt-1">
                Showing dishes matching your energy: <strong>{mood === 'Quick' ? 'Quick & Easy (< 20 mins)' : mood === 'Comfort' ? 'Comfort Food' : mood === 'Healthy' ? 'Light & Healthy' : 'Special Feast'}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <button
              onClick={() => {
                playChime('med');
                setOnlyCurrentMealSlot(!onlyCurrentMealSlot);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all border-2 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                onlyCurrentMealSlot
                  ? 'bg-[#588157] text-white border-[#588157]'
                  : 'bg-white text-[#7D7065] border-[#E8DEC8] hover:border-[#588157]'
              }`}
            >
              <span>{onlyCurrentMealSlot ? `✓ ${mealSlot} Dishes Only` : 'Showing All Slots'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic AI Recipe Engine: Ask Chef Mom */}
        <AskChefMomBar
          onGenerate={handleGenerateCustomDishes}
          isLoading={isGenerating}
          inStockPantryCount={inStockPantryCount}
          recentDishes={customRecipes}
          onCookRecipe={handleStartCooking}
          onDeleteDish={handleDeleteCustomRecipe}
          onClearRecent={() => {
            localStorage.removeItem('moms_rasoi_custom_recipes_v1');
            setCustomRecipes([]);
          }}
          mealSlot={mealSlot}
          weather={weather}
          mood={mood}
        />

        {generationError && (
          <div className="bg-[#FFF1EE] border border-[#E06D53]/30 rounded-2xl p-3.5 flex items-center justify-between text-xs text-[#992812] shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E06D53] shrink-0" />
              <span>{generationError}</span>
            </div>
            <button
              onClick={() => setGenerationError(null)}
              className="text-[11px] font-bold text-[#E06D53] hover:underline ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 4. Interactive Quick-Tap Pantry Rack (The Spice & Veggie Basket) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8DCCF] shadow-kitchen-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#588157]/10 text-[#588157]">
                <ShoppingBag className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#2D3142] font-heading uppercase tracking-wide">
                  {getTranslation('quickTapTitle', language)}
                </h4>
                <p className="text-[11px] text-[#7D7065]">
                  {getTranslation('quickTapSubtitle', language)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPantryOpen(true)}
              className="text-xs font-black text-[#E06D53] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{getTranslation('viewAllStock', language)}</span>
            </button>
          </div>

          {/* Quick Tap Chips Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {QUICK_PANTRY_ITEMS.map((item) => {
              const pantryItem = pantryItems.find((p) => p.id === item.id);
              const inStock = pantryItem ? pantryItem.inStock : false;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playChime(inStock ? 'low' : 'high');
                    handleTogglePantryItem(item.id);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all border-2 cursor-pointer active:scale-95 select-none ${
                    inStock
                      ? 'bg-[#EBF5EE] border-[#588157] text-[#1E5224] shadow-xs'
                      : 'bg-[#F7F3EB] border-dashed border-[#DFD3C3] text-gray-400 hover:border-gray-400'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      inStock ? 'bg-[#588157] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {inStock ? '✓' : '✕'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Spotlight Hero: "Mom's Top Stovetop Match" */}
        {spotlightRecipe && (
          <div className="bg-gradient-to-r from-[#2D1F17] via-[#36261E] to-[#2B1B15] text-white rounded-3xl p-6 sm:p-8 border border-[#523E33] shadow-kitchen-console flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#E06D53]/25 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start gap-4 sm:gap-5 z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#E06D53] to-[#F59E0B] flex items-center justify-center text-4xl shadow-2xl shrink-0">
                <span className="animate-gentle-float">{spotlightRecipe.recipe.emoji || '🍲'}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#E06D53] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>Top Recommendation</span>
                  </span>
                  <span className="text-xs text-[#F59E0B] font-bold">
                    ★ {spotlightRecipe.finalScore}% Match
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
                  {spotlightRecipe.recipe.title}
                </h3>
                {spotlightRecipe.recipe.hindiTitle && (
                  <p className="text-xs font-semibold text-[#ECCF9B] mt-0.5">
                    {spotlightRecipe.recipe.hindiTitle}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-white/70 max-w-xl mt-1.5 leading-relaxed line-clamp-2">
                  {spotlightRecipe.recipe.description}
                </p>
              </div>
            </div>

            {/* Quick Action Button for Spotlight */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto z-10">
              <button
                onClick={() => {
                  playChime('high');
                  handleStartCooking(spotlightRecipe.recipe);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white font-heading font-black text-sm flex items-center justify-center gap-2 shadow-kitchen-button hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Cook This Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {spotlightRecipe.recipe.techniques && (
                <button
                  onClick={() => handleOpenTechniqueVideo(spotlightRecipe.recipe.techniques![0])}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Watch Technique</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. Filter & Search Control Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Output Tiers Selector Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => {
                  playChime('med');
                  setTierFilter('all');
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  tierFilter === 'all'
                    ? 'bg-[#2D3142] text-white shadow-md'
                    : 'bg-white text-[#7D7065] border border-[#E8DEC8] hover:bg-gray-50'
                }`}
              >
                <span>{onlyCurrentMealSlot ? `All ${mealSlot}` : 'All Dishes'}</span>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                  {onlyCurrentMealSlot ? activeContextRecipes.length : allAvailableRecipes.length}
                </span>
              </button>

              <button
                onClick={() => {
                  playChime('med');
                  setTierFilter('ready');
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  tierFilter === 'ready'
                    ? 'bg-[#588157] text-white shadow-md ring-2 ring-[#588157]/20'
                    : 'bg-white text-[#1E5224] border border-[#588157]/30 hover:bg-[#588157]/10'
                }`}
              >
                <span>{getTranslation('readyFilter', language)}</span>
                <span className="text-[11px] bg-white/30 px-2 py-0.5 rounded-full font-black">
                  {readyCount}
                </span>
              </button>

              <button
                onClick={() => {
                  playChime('med');
                  setTierFilter('missing-few');
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  tierFilter === 'missing-few'
                    ? 'bg-[#F59E0B] text-black shadow-md ring-2 ring-[#F59E0B]/20'
                    : 'bg-white text-[#92400E] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/10'
                }`}
              >
                <span>{getTranslation('missingFilter', language)}</span>
                <span className="text-[11px] bg-black/15 px-2 py-0.5 rounded-full font-black">
                  {missingCount}
                </span>
              </button>

              <button
                onClick={() => {
                  playChime('med');
                  setTierFilter('explore');
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  tierFilter === 'explore'
                    ? 'bg-[#7D7065] text-white shadow-md'
                    : 'bg-white text-[#7D7065] border border-[#E8DEC8] hover:bg-gray-50'
                }`}
              >
                <span>{getTranslation('exploreFilter', language)}</span>
                <span className="text-[11px] bg-white/30 px-2 py-0.5 rounded-full font-black">
                  {exploreCount}
                </span>
              </button>
            </div>

            {/* Live Search & Cuisine Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={getTranslation('searchPlaceholder', language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-2xl border border-[#E8DEC8] text-xs sm:text-sm text-[#2D3142] focus:outline-none focus:border-[#E06D53]"
                />
              </div>

              {/* Favorites toggle */}
              <button
                onClick={() => {
                  playChime('med');
                  setOnlyFavorites(!onlyFavorites);
                }}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  onlyFavorites
                    ? 'bg-red-50 border-red-300 text-red-500 shadow-2xs'
                    : 'bg-white border-[#E8DEC8] text-gray-400 hover:text-red-400'
                }`}
                title="Filter Mom's Favorites"
              >
                <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Cuisine Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {CUISINES.map((c) => {
              const isSelected = selectedCuisine === c;
              return (
                <button
                  key={c}
                  onClick={() => {
                    playChime('med');
                    setSelectedCuisine(c);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#E06D53] text-white shadow-2xs'
                      : 'bg-white text-[#7D7065] border border-[#E8DEC8] hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Recipe Grid (The Gourmet Studio) */}
        {displayedRecipes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EBDDCF] shadow-kitchen">
            <span className="text-4xl mb-3 block">🍳</span>
            <h3 className="text-lg font-bold text-[#2D3142] font-heading">
              No recipes matched your active filter
            </h3>
            <p className="text-xs sm:text-sm text-[#7D7065] mt-1 max-w-md mx-auto leading-relaxed">
              Try switching your filter to "All Dishes" or toggling items in your Smart Digital Pantry!
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setTierFilter('all');
                  setSelectedCuisine('All');
                  setSearchQuery('');
                  setOnlyFavorites(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#E06D53] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsPantryOpen(true)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#2D3142] font-bold text-xs cursor-pointer"
              >
                Open Kitchen Stock
              </button>
            </div>
          </div>
        ) : tierFilter === 'all' ? (
          /* Dynamic Contextual Sections: Ready First, Then Missing 1-2, Then Others */
          <div className="flex flex-col gap-8">
            {/* 1. Ready to Cook Right Now Section */}
            {readyDishes.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-[#588157]/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#588157] animate-pulse" />
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#1E5224] font-heading flex items-center gap-2">
                        <span>{getTranslation('readyToCookSection', language)}</span>
                        <span className="text-xs bg-[#EBF5EE] text-[#1E5224] px-2.5 py-0.5 rounded-full border border-[#588157]/30 font-mono font-black">
                          {readyDishes.length} {readyDishes.length === 1 ? 'dish' : 'dishes'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#588157] font-semibold">
                        {getTranslation('readyToCookSub', language)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {readyDishes.map((scored) => (
                    <RecipeCard
                      key={scored.recipe.id}
                      scoredRecipe={scored}
                      onCookRecipe={handleStartCooking}
                      onOpenSubstituteModal={(sc) => setSubstituteModalScored(sc)}
                      onOpenTechnique={handleOpenTechniqueVideo}
                      onQueueContinuous={handleQueueContinuous}
                      isFavorite={recipeNotes[scored.recipe.id]?.isFavorite || false}
                      onToggleFavorite={handleToggleFavorite}
                      currentLanguage={language}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Missing Only 1-2 Items Section */}
            {missingDishes.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-[#F59E0B]/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#92400E] font-heading flex items-center gap-2">
                        <span>{getTranslation('missingFewSection', language)}</span>
                        <span className="text-xs bg-[#FFFBEB] text-[#92400E] px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30 font-mono font-black">
                          {missingDishes.length} {missingDishes.length === 1 ? 'dish' : 'dishes'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#92400E] font-semibold">
                        {getTranslation('missingFewSub', language)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {missingDishes.map((scored) => (
                    <RecipeCard
                      key={scored.recipe.id}
                      scoredRecipe={scored}
                      onCookRecipe={handleStartCooking}
                      onOpenSubstituteModal={(sc) => setSubstituteModalScored(sc)}
                      onOpenTechnique={handleOpenTechniqueVideo}
                      onQueueContinuous={handleQueueContinuous}
                      isFavorite={recipeNotes[scored.recipe.id]?.isFavorite || false}
                      onToggleFavorite={handleToggleFavorite}
                      currentLanguage={language}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. More Recipes in this Category */}
            {exploreDishes.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-400" />
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#7D7065] font-heading flex items-center gap-2">
                        <span>{getTranslation('moreIdeasSection', language)} ({mealSlot})</span>
                        <span className="text-xs bg-gray-100 text-[#7D7065] px-2.5 py-0.5 rounded-full border border-gray-200 font-mono font-black">
                          {exploreDishes.length}
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#7D7065]">
                        {getTranslation('moreIdeasSub', language)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exploreDishes.map((scored) => (
                    <RecipeCard
                      key={scored.recipe.id}
                      scoredRecipe={scored}
                      onCookRecipe={handleStartCooking}
                      onOpenSubstituteModal={(sc) => setSubstituteModalScored(sc)}
                      onOpenTechnique={handleOpenTechniqueVideo}
                      onQueueContinuous={handleQueueContinuous}
                      isFavorite={recipeNotes[scored.recipe.id]?.isFavorite || false}
                      onToggleFavorite={handleToggleFavorite}
                      currentLanguage={language}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedRecipes.map((scored) => (
              <RecipeCard
                key={scored.recipe.id}
                scoredRecipe={scored}
                onCookRecipe={handleStartCooking}
                onOpenSubstituteModal={(sc) => setSubstituteModalScored(sc)}
                onOpenTechnique={handleOpenTechniqueVideo}
                onQueueContinuous={handleQueueContinuous}
                isFavorite={recipeNotes[scored.recipe.id]?.isFavorite || false}
                onToggleFavorite={handleToggleFavorite}
                currentLanguage={language}
              />
            ))}
          </div>
        )}
      </main>

      {/* 8. Footer */}
      <footer className="bg-[#F4ECE1] border-t border-[#E8DCCF] py-8 px-4 sm:px-6 mt-12 text-center text-xs text-[#7D7065]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-heading font-black text-[#2D3142]">
            <span className="text-xl">🍲</span>
            <span>Mom’s Rasoi OS 2.0</span>
            <span className="text-gray-300">•</span>
            <span className="font-normal text-[#7D7065]">
              Algorithmic Local Kitchen Assistant
            </span>
          </div>
          <p className="text-[11px]">
            Zero External AI / Camera APIs • Pure Structured Filtering • Data Saved Locally
          </p>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. The Smart Digital Pantry Drawer */}
      <PantryDrawer
        isOpen={isPantryOpen}
        onClose={() => setIsPantryOpen(false)}
        pantryItems={pantryItems}
        onToggleItem={handleTogglePantryItem}
        onAddItem={handleAddPantryItem}
        onRemoveItem={handleRemovePantryItem}
        onResetDefaults={handleResetDefaults}
        onSelectAllCategory={handleSelectAllCategory}
      />

      {/* 2. Interactive Cooking Mode (Mom's Clean Screen) */}
      <CookingModeModal
        recipe={activeCookingRecipe}
        isOpen={activeCookingRecipe !== null}
        onClose={() => setActiveCookingRecipe(null)}
        onOpenTechnique={handleOpenTechniqueVideo}
        onLogCooked={handleLogCookedMeal}
        onSaveNote={handleSaveRecipeNote}
        savedNote={activeCookingRecipe ? recipeNotes[activeCookingRecipe.id] : undefined}
        currentMealSlot={mealSlot}
      />

      {/* 3. Continuous Multi-Dish Cooking Flow Coordinator */}
      <ContinuousCookingModal
        isOpen={isContinuousCookingOpen}
        onClose={() => setIsContinuousCookingOpen(false)}
        recipes={RECIPES}
        initialRecipes={continuousInitialRecipes}
      />

      {/* 4. Rasoi Video Studio & Step-by-Step Cooking Technique Animations */}
      <VideoStudioModal
        isOpen={isVideoStudioOpen}
        onClose={() => setIsVideoStudioOpen(false)}
        initialTechniqueId={videoStudioInitialId}
        recipes={RECIPES}
        onSelectRecipe={handleStartCooking}
      />

      {/* 5. Daily Meal Journal & Mom's Secret Notes */}
      <MealJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        journalEntries={journalEntries}
        recipeNotes={recipeNotes}
        recipes={RECIPES}
        onDeleteJournalEntry={handleDeleteJournalEntry}
        onAddManualEntry={handleLogCookedMeal}
        onSaveNote={handleSaveRecipeNote}
        onSelectRecipe={handleStartCooking}
      />

      {/* 6. Smart Kitchen Substitutes Modal */}
      <SubstituteModal
        scoredRecipe={substituteModalScored}
        isOpen={substituteModalScored !== null}
        onClose={() => setSubstituteModalScored(null)}
        onCookRecipe={handleStartCooking}
        onMarkInStock={handleMarkItemInStockByName}
      />
    </div>
  );
}

export default App;
