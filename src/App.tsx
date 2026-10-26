import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ShoppingBag,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  Compass,
  Layers,
  Heart,
  Clock,
  RotateCcw,
  ChefHat
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

export function App() {
  // 1. Persistent Pantry & User Data
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => loadPantry());
  const [journalEntries, setJournalEntries] = useState<MealJournalEntry[]>(() => loadJournal());
  const [recipeNotes, setRecipeNotes] = useState<Record<string, RecipeNote>>(() => loadNotes());

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
  const [cuisineFilter, setCuisineFilter] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

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
  const rankedRecipes = useMemo(() => {
    return scoreAndRankRecipes(RECIPES, pantryItems, mealSlot, weather, mood);
  }, [pantryItems, mealSlot, weather, mood]);

  // Tier counts
  const readyCount = useMemo(
    () => rankedRecipes.filter((r) => r.tier === 'ready').length,
    [rankedRecipes]
  );
  const missingCount = useMemo(
    () => rankedRecipes.filter((r) => r.tier === 'missing-few').length,
    [rankedRecipes]
  );
  const exploreCount = useMemo(
    () => rankedRecipes.filter((r) => r.tier === 'explore').length,
    [rankedRecipes]
  );

  // Filtered recipes
  const displayedRecipes = useMemo(() => {
    return rankedRecipes.filter((item) => {
      // Tier filter
      if (tierFilter !== 'all' && item.tier !== tierFilter) return false;

      // Cuisine filter
      if (cuisineFilter !== 'all') {
        if (!item.recipe.cuisine.toLowerCase().includes(cuisineFilter.toLowerCase())) {
          return false;
        }
      }

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
  }, [rankedRecipes, tierFilter, cuisineFilter, onlyFavorites, searchQuery, recipeNotes]);

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
      // Add as custom item
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

  const inStockPantryCount = pantryItems.filter((i) => i.inStock).length;

  // Time of Day Greeting for Mom
  const greetingText = useMemo(() => {
    if (mealSlot === 'Breakfast') {
      return {
        title: 'Good Morning, Mom! 🌅',
        subtitle: "Here is what you can prepare for wholesome breakfast with today's kitchen stock."
      };
    }
    if (mealSlot === 'Lunch') {
      return {
        title: 'Good Afternoon, Mom! ☀️',
        subtitle: 'Warm, satisfying midday meal suggestions strictly matched to your pantry ingredients.'
      };
    }
    if (mealSlot === 'Snacks') {
      return {
        title: 'Chai & Snacks Time, Mom! ☕',
        subtitle: 'Crispy fritters, savory pancakes, and fragrant tea treats for the family.'
      };
    }
    return {
      title: 'Good Evening, Mom! 🌙',
      subtitle: 'Nourishing, comforting dinner options ready in under 25 minutes.'
    };
  }, [mealSlot]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3142] flex flex-col selection:bg-[#E06D53]/20 selection:text-[#E06D53]">
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
      />

      {/* 2. Hero Warm Greeting Banner */}
      <section className="bg-gradient-to-b from-[#F7F3EB] to-[#FDFBF7] border-b border-[#EBDDCF] py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#588157] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#588157]">
                Live Algorithmic Kitchen Matcher
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2D3142] font-heading mt-1">
              {greetingText.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7065] mt-1 max-w-2xl leading-relaxed">
              {greetingText.subtitle}
            </p>
          </div>

          {/* Quick Shortcuts Pill Group */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsContinuousCookingOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#E06D53] hover:bg-[#c9573f] text-white font-heading font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#E06D53]/25 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Multi-Dish Stove Flow</span>
            </button>

            <button
              onClick={() => {
                setVideoStudioInitialId(null);
                setIsVideoStudioOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-gray-50 border border-[#E8DEC8] text-[#2D3142] font-heading font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>Video Studio</span>
            </button>
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

        {/* Tier Summary Tabs & Search Bar (Feature C) */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Output Tiers Selector Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => {
                  playChime('med');
                  setTierFilter('all');
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  tierFilter === 'all'
                    ? 'bg-[#2D3142] text-white shadow-md'
                    : 'bg-white text-[#7D7065] border border-[#E8DEC8] hover:bg-gray-50'
                }`}
              >
                <span>All Dishes</span>
                <span className="text-[11px] bg-white/20 px-1.5 py-0.5 rounded-full">
                  {RECIPES.length}
                </span>
              </button>

              <button
                onClick={() => {
                  playChime('med');
                  setTierFilter('ready');
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  tierFilter === 'ready'
                    ? 'bg-[#588157] text-white shadow-md'
                    : 'bg-white text-[#2E5E2D] border border-[#588157]/30 hover:bg-[#588157]/10'
                }`}
              >
                <span>🟢 Ready to Cook!</span>
                <span className="text-[11px] bg-white/30 px-1.5 py-0.5 rounded-full font-bold">
                  {readyCount}
                </span>
              </button>

              <button
                onClick={() => {
                  playChime('med');
                  setTierFilter('missing-few');
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  tierFilter === 'missing-few'
                    ? 'bg-[#F59E0B] text-black shadow-md'
                    : 'bg-white text-[#92400E] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/10'
                }`}
              >
                <span>🟡 Missing 1-2 Items</span>
                <span className="text-[11px] bg-black/15 px-1.5 py-0.5 rounded-full font-bold">
                  {missingCount}
                </span>
              </button>

              <button
                onClick={() => {
                  playChime('med');
                  setTierFilter('explore');
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  tierFilter === 'explore'
                    ? 'bg-[#7D7065] text-white shadow-md'
                    : 'bg-white text-[#7D7065] border border-[#E8DEC8] hover:bg-gray-50'
                }`}
              >
                <span>⚪ Explore Others</span>
                <span className="text-[11px] bg-white/30 px-1.5 py-0.5 rounded-full font-bold">
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
                  placeholder="Search khichdi, paneer, paratha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#E8DEC8] text-xs sm:text-sm text-[#2D3142] focus:outline-none focus:border-[#E06D53]"
                />
              </div>

              {/* Favorites toggle */}
              <button
                onClick={() => {
                  playChime('med');
                  setOnlyFavorites(!onlyFavorites);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
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

          {/* Low Pantry Alert Banner if less than 15 items in stock */}
          {inStockPantryCount < 15 && (
            <div className="p-3.5 bg-[#FFF9F2] rounded-2xl border border-[#F5D8BA] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8C3A00]">
                <ShoppingBag className="w-4 h-4 text-[#E06D53] shrink-0" />
                <span>
                  Mom, you only have <strong>{inStockPantryCount} items</strong> checked in your pantry.
                </span>
              </div>
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-xl bg-[#E06D53] text-white text-xs font-bold shadow-xs hover:bg-[#c9573f] transition-all cursor-pointer"
              >
                Restock Standard Indian Staples
              </button>
            </div>
          )}
        </div>

        {/* 4. Recipe Grid */}
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
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. Footer */}
      <footer className="bg-[#F7F3EB] border-t border-[#EBDDCF] py-6 px-4 sm:px-6 mt-12 text-center text-xs text-[#7D7065]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-heading font-bold text-[#2D3142]">
            <span>🍲 Mom’s Rasoi</span>
            <span>•</span>
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
