import { PantryItem, MealJournalEntry, RecipeNote, MealSlot, Weather, Mood } from '../types';
import { DEFAULT_PANTRY_ITEMS } from '../data/pantryDefaults';

const PANTRY_KEY = 'moms_rasoi_pantry_v2';
const JOURNAL_KEY = 'moms_rasoi_journal_v2';
const NOTES_KEY = 'moms_rasoi_notes_v2';
const CONTEXT_KEY = 'moms_rasoi_context_v2';

export function loadPantry(): PantryItem[] {
  try {
    const raw = localStorage.getItem(PANTRY_KEY);
    if (!raw) {
      savePantry(DEFAULT_PANTRY_ITEMS);
      return DEFAULT_PANTRY_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load pantry from localStorage, seeding defaults', err);
  }
  return DEFAULT_PANTRY_ITEMS;
}

export function savePantry(items: PantryItem[]): void {
  try {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save pantry to localStorage', err);
  }
}

export function loadJournal(): MealJournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load journal', err);
  }
  // Default sample entry if empty so Mom sees how the diary works!
  const today = new Date().toISOString().split('T')[0];
  const sampleEntry: MealJournalEntry = {
    id: 'sample-entry-1',
    recipeId: 'dal-khichdi',
    recipeTitle: 'Moong Dal Khichdi with Tadka',
    cuisine: 'Indian Comfort',
    mealSlot: 'Dinner',
    date: today,
    timestamp: Date.now() - 86400000,
    note: 'Added extra golden ghee tadka with hing, the whole family loved it!',
    rating: 5,
    servings: 4
  };
  return [sampleEntry];
}

export function saveJournal(entries: MealJournalEntry[]): void {
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save journal', err);
  }
}

export function loadNotes(): Record<string, RecipeNote> {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load recipe notes', err);
  }
  return {
    'dal-khichdi': {
      recipeId: 'dal-khichdi',
      note: 'Kids loved this with extra roasted cumin and crushed papad!',
      rating: 5,
      isFavorite: true
    },
    'adrak-chai-onion-pakora': {
      recipeId: 'adrak-chai-onion-pakora',
      note: 'Perfect rainy evening treat. 1/2 tsp ajwain is essential.',
      rating: 5,
      isFavorite: true
    }
  };
}

export function saveNotes(notes: Record<string, RecipeNote>): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes', err);
  }
}

export interface SavedContext {
  mealSlot?: MealSlot;
  weather?: Weather;
  mood?: Mood;
  autoMealSlotEnabled?: boolean;
}

export function loadContext(): SavedContext | null {
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load context', err);
  }
  return null;
}

export function saveContext(ctx: SavedContext): void {
  try {
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx));
  } catch (err) {
    console.error('Failed to save context', err);
  }
}
