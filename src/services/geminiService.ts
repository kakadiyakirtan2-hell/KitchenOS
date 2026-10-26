import { Recipe, MealSlot, Weather, Mood } from '../types';

const CUSTOM_RECIPES_STORAGE_KEY = 'moms_rasoi_custom_recipes_v1';
const USER_KEY_STORAGE = 'moms_rasoi_gemini_api_key';

// Encoded default fallback key (decoded at runtime)
const DEFAULT_B64 = 'QVEuQWI4Uk42S0RvRm40R0hjSnF3TGVuaXQ1WjdyQ3NXNFhOYmJvYVlsWTRFU1V0RWJUbmc=';

export function getGeminiApiKey(): string {
  try {
    const userCustom = localStorage.getItem(USER_KEY_STORAGE);
    if (userCustom && userCustom.trim()) return userCustom.trim();

    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim()) return envKey.trim();

    return atob(DEFAULT_B64);
  } catch {
    return '';
  }
}

export function saveUserGeminiKey(key: string): void {
  try {
    localStorage.setItem(USER_KEY_STORAGE, key.trim());
  } catch (err) {
    console.error('Failed to save user Gemini key', err);
  }
}

export interface GenerateRecipeParams {
  pantry: string[];
  servings: number;
  mealSlot: MealSlot | 'Any';
  weather: Weather | 'Normal';
  mood: Mood | 'Comfort';
  extraNotes?: string;
}

export function loadSavedCustomRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(CUSTOM_RECIPES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load custom recipes from localStorage', err);
  }
  return [];
}

export function saveCustomRecipe(recipe: Recipe): void {
  try {
    const existing = loadSavedCustomRecipes();
    const updated = [recipe, ...existing.filter((r) => r.id !== recipe.id)];
    localStorage.setItem(CUSTOM_RECIPES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom recipe', err);
  }
}

/**
 * Calls the backend /api/generate-recipes on Vercel, with automatic client-side fallback
 */
export async function generateRecipesWithGemini(
  paramsOrPantry: GenerateRecipeParams | any[],
  servingsParam?: number,
  mealSlotParam?: MealSlot | 'Any',
  weatherParam?: Weather | 'Normal',
  moodParam?: Mood | 'Comfort',
  extraNotesParam?: string
): Promise<Recipe[]> {
  let pantry: string[] = [];
  let servings = 4;
  let mealSlot: MealSlot | 'Any' = 'Any';
  let weather: Weather | 'Normal' = 'Normal';
  let mood: Mood | 'Comfort' = 'Comfort';
  let extraNotes = '';

  if (Array.isArray(paramsOrPantry)) {
    // Positional call or pantry array
    pantry = paramsOrPantry.map((item: any) =>
      typeof item === 'string' ? item : item?.name || ''
    ).filter(Boolean);
    servings = servingsParam ?? 4;
    mealSlot = mealSlotParam ?? 'Any';
    weather = weatherParam ?? 'Normal';
    mood = moodParam ?? 'Comfort';
    extraNotes = extraNotesParam ?? '';
  } else {
    // Object call
    const p = paramsOrPantry.pantry || [];
    pantry = Array.isArray(p)
      ? p.map((item: any) => (typeof item === 'string' ? item : item?.name || '')).filter(Boolean)
      : [];
    servings = paramsOrPantry.servings || 4;
    mealSlot = paramsOrPantry.mealSlot || 'Any';
    weather = paramsOrPantry.weather || 'Normal';
    mood = paramsOrPantry.mood || 'Comfort';
    extraNotes = paramsOrPantry.extraNotes || '';
  }

  if (pantry.length === 0) {
    pantry = ['Potato', 'Onion', 'Tomato', 'Rice', 'Atta', 'Ghee', 'Spices'];
  }

  const effectiveApiKey = getGeminiApiKey();

  // 1. Try Vercel Serverless API first
  try {
    const res = await fetch('/api/generate-recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pantry,
        servings,
        mealSlot,
        weather,
        mood,
        extraNotes,
        apiKey: effectiveApiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.recipes) && data.recipes.length > 0) {
        return normalizeGeneratedRecipes(data.recipes);
      }
    }
  } catch (err) {
    console.debug('Vercel API route not available or error, using direct Gemini fallback', err);
  }

  // 2. Client-side direct fallback using Gemini 3.5 Flash Lite
  const prompt = `
You are a warm, traditional home-cooking culinary assistant designed for an Indian mother ("Mom's Rasoi").
The user wants custom home-cooked recipes that can be prepared with what they currently have in their kitchen.

USER INPUT:
- Available Pantry Items: ${pantry.join(', ')}
- Number of People (Servings): ${servings}
- Meal Slot: ${mealSlot}
- Current Weather: ${weather}
- Mood / Style: ${mood}
- Specific request / craving: ${extraNotes || 'None'}

RULES:
1. Suggest 2 practical, delicious, authentic home-cooked dishes tailored to the requested servings and cravings.
2. Maximize the use of the listed available pantry items.
3. Keep instructions step-by-step, simple, and mom-friendly.
4. Output ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "gemini-${Date.now()}-1",
    "title": "Dish Title in English",
    "hindiTitle": "Dish Title in Hindi / Devanagari",
    "cuisine": "Cuisine name e.g. North Indian, Punjabi, Gujarati, South Indian, Street Food",
    "prepTime": 10,
    "cookTime": 15,
    "servings": ${servings},
    "mealSlot": ["${mealSlot !== 'Any' ? mealSlot : 'Dinner'}"],
    "weather": ["${weather !== 'Normal' ? weather : 'Sunny'}"],
    "mood": ["${mood || 'Comfort'}"],
    "difficulty": "Easy",
    "tags": ["Freshly Created", "Homestyle"],
    "description": "Appetizing description of the dish",
    "ingredients": [
      { "name": "Ingredient Name", "qty": "1 cup", "required": true }
    ],
    "substitutions": {
      "Optional or Missing Item": "Alternative substitute"
    },
    "steps": [
      "Step 1 instruction...",
      "Step 2 instruction..."
    ],
    "timers": [300, 600],
    "momSecretTip": "Mom's golden culinary tip for this dish",
    "emoji": "🍲"
  }
]
`;

  const directRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${effectiveApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: 'application/json' },
      }),
    }
  );

  if (!directRes.ok) {
    const errorText = await directRes.text();
    throw new Error(`Gemini Error: ${errorText}`);
  }

  const directData = await directRes.json();
  const rawText = directData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const recipes = JSON.parse(rawText);

  return normalizeGeneratedRecipes(recipes);
}

function normalizeGeneratedRecipes(rawList: any[]): Recipe[] {
  return rawList.map((item, idx) => ({
    id: item.id || `custom-gemini-${Date.now()}-${idx}`,
    title: item.title || 'Special Custom Recipe',
    hindiTitle: item.hindiTitle || 'खास घरेलू डिश',
    cuisine: item.cuisine || 'Homestyle Special',
    prepTime: Number(item.prepTime) || 12,
    cookTime: Number(item.cookTime) || 15,
    servings: Number(item.servings) || 4,
    mealSlot: Array.isArray(item.mealSlot) ? item.mealSlot : ['Dinner'],
    weather: Array.isArray(item.weather) ? item.weather : ['Sunny'],
    mood: Array.isArray(item.mood) ? item.mood : ['Comfort'],
    difficulty: item.difficulty || 'Easy',
    tags: Array.isArray(item.tags) ? ['Freshly Created', ...item.tags] : ['Freshly Created'],
    description: item.description || 'Specially customized for mom based on available ingredients.',
    ingredients: Array.isArray(item.ingredients)
      ? item.ingredients.map((ing: any) => ({
          name: ing.name || 'Ingredient',
          qty: ing.qty || 'As required',
          required: ing.required !== false,
        }))
      : [],
    substitutions: item.substitutions || {},
    steps: Array.isArray(item.steps) ? item.steps : ['Cook with love and serve warm.'],
    timers: Array.isArray(item.timers) ? item.timers : [300],
    momSecretTip: item.momSecretTip || 'Cook on medium flame and taste as you go!',
    emoji: item.emoji || '✨',
  }));
}
