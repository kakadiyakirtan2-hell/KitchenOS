export type MealSlot = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

export type Weather = 'Sunny' | 'Rainy' | 'Chilly';

export type Mood = 'Quick' | 'Comfort' | 'Healthy' | 'Leisurely';

export type IngredientCategory = 'veggies' | 'grains' | 'dairy' | 'spices';

export interface PantryItem {
  id: string;
  name: string;
  hindiName?: string;
  category: IngredientCategory;
  inStock: boolean;
  isCustom?: boolean;
  icon?: string;
}

export interface RecipeIngredient {
  name: string;
  qty: string;
  required: boolean;
  unit?: string;
}

export interface Recipe {
  id: string;
  title: string;
  hindiTitle?: string;
  cuisine: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  mealSlot: MealSlot[];
  weather: Weather[];
  mood: Mood[];
  difficulty: 'Easy' | 'Medium' | 'Leisurely';
  tags: string[];
  description: string;
  ingredients: RecipeIngredient[];
  substitutions: Record<string, string>;
  steps: string[];
  timers: number[]; // seconds
  techniques?: string[]; // IDs of technique animations
  momSecretTip?: string;
  emoji?: string;
}

export type MatchTier = 'ready' | 'missing-few' | 'explore';

export interface ScoredRecipe {
  recipe: Recipe;
  baseScore: number;
  bonusScore: number;
  finalScore: number;
  tier: MatchTier;
  missingRequired: string[];
  missingSubstitutes: { item: string; substitute: string }[];
  matchedCount: number;
  totalRequired: number;
}

export interface MealJournalEntry {
  id: string;
  recipeId: string;
  recipeTitle: string;
  cuisine: string;
  mealSlot: MealSlot;
  date: string; // YYYY-MM-DD
  timestamp: number;
  note?: string;
  rating?: number;
  servings: number;
}

export interface RecipeNote {
  recipeId: string;
  note: string;
  rating: number; // 0-5
  isFavorite: boolean;
  lastCooked?: string;
}

export interface TechniqueAnimation {
  id: string;
  title: string;
  hindiTitle: string;
  category: 'Sizzle & Tadka' | 'Tawa & Bread' | 'Simmer & Boil' | 'Dough & Batter';
  description: string;
  visualCue: string;
  keyTips: string[];
  soundType: 'sizzle' | 'boil' | 'puff' | 'whisk';
}

export interface ActiveTimer {
  id: string;
  recipeId: string;
  recipeTitle: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}
