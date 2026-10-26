import { Recipe, PantryItem, MealSlot, Weather, Mood, ScoredRecipe, MatchTier } from '../types';

/**
 * Normalizes ingredient names to help flexible substring/token matching
 */
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/**
 * Checks if a recipe ingredient is in stock in the user's pantry
 */
export function isIngredientInStock(
  ingredientName: string,
  pantryItems: PantryItem[]
): boolean {
  const normIng = normalizeName(ingredientName);
  
  // Direct match by ID or exact normalized name
  const inStockItems = pantryItems.filter((item) => item.inStock);

  return inStockItems.some((item) => {
    const itemNormName = normalizeName(item.name);
    const itemHindi = item.hindiName ? normalizeName(item.hindiName) : '';
    
    // Check direct equality
    if (itemNormName === normIng || itemHindi === normIng) return true;

    // Check key token overlaps (e.g. "Toor Dal" matches "Toor Dal / Arhar Dal")
    const ingTokens = normIng.split(/\s+/).filter(Boolean);
    const itemTokens = itemNormName.split(/\s+/).filter(Boolean);

    // If both have "rice" or "paneer" or "potato" or "ghee" or "moong" or "curd"
    const commonSignificantTokens = [
      'potato', 'onion', 'tomato', 'paneer', 'spinach', 'rice', 'dal', 'ghee',
      'butter', 'cheese', 'milk', 'curd', 'besan', 'atta', 'flour', 'poha',
      'suji', 'rava', 'oats', 'chana', 'rajma', 'cauliflower', 'gobi', 'peas',
      'matar', 'capsicum', 'carrot', 'garlic', 'ginger', 'chili', 'cumin',
      'mustard', 'turmeric', 'coriander', 'noodles', 'pasta', 'bread', 'sabudana',
      'eggplant', 'baingan', 'oil', 'salt', 'sugar', 'methi', 'lemon',
      'sattu', 'makki', 'coconut', 'tamarind', 'imli', 'jaggery', 'gur', 'cashew',
      'kaju', 'curry', 'bhindi', 'okra', 'lauki', 'gourd', 'drumstick', 'cabbage',
      'mint', 'pudina', 'amchur', 'saunf', 'fennel', 'ajwain', 'pepper', 'cardamom',
      'hing', 'vermicelli', 'soya'
    ];

    for (const token of commonSignificantTokens) {
      if (ingTokens.includes(token) && itemTokens.includes(token)) {
        // Special case for dal varieties: distinguish moong, toor, urad, chana
        if (token === 'dal') {
          const dalTypes = ['moong', 'toor', 'urad', 'chana', 'masoor'];
          const ingType = dalTypes.find((d) => ingTokens.includes(d));
          const itemType = dalTypes.find((d) => itemTokens.includes(d));
          if (ingType && itemType) return ingType === itemType;
        }
        return true;
      }
    }

    return itemNormName.includes(normIng) || normIng.includes(itemNormName);
  });
}

/**
 * Pure algorithmic matching logic according to system specifications
 */
export function scoreRecipe(
  recipe: Recipe,
  pantryItems: PantryItem[],
  currentMealSlot: MealSlot,
  currentWeather: Weather,
  currentMood: Mood
): ScoredRecipe {
  const requiredIngredients = recipe.ingredients.filter((i) => i.required);
  const totalRequired = requiredIngredients.length;

  let matchedCount = 0;
  const missingRequired: string[] = [];

  for (const ing of requiredIngredients) {
    if (isIngredientInStock(ing.name, pantryItems)) {
      matchedCount++;
    } else {
      missingRequired.push(ing.name);
    }
  }

  // Base Score: (Count of available pantry ingredients matching required) / (Total required) * 100
  const baseScore = totalRequired > 0 
    ? Math.round((matchedCount / totalRequired) * 100) 
    : 100;

  // Bonus Points:
  // +15% if matches current meal slot
  // +10% if matches current weather
  // +10% if matches current mood
  let bonusScore = 0;
  if (recipe.mealSlot.includes(currentMealSlot)) bonusScore += 15;
  if (recipe.weather.includes(currentWeather)) bonusScore += 10;
  if (recipe.mood.includes(currentMood)) bonusScore += 10;

  const rawFinalScore = baseScore + (baseScore > 0 ? bonusScore : 0);
  const finalScore = Math.min(100, Math.round(rawFinalScore));

  // Determine Output Tier:
  // 🟢 "Ready to Cook!" (100% match of required ingredients)
  // 🟡 "Missing Only 1-2 Items" (80-99% match, or missing <= 2 items with strong base)
  // ⚪ "Explore Recipes"
  let tier: MatchTier = 'explore';
  if (missingRequired.length === 0) {
    tier = 'ready';
  } else if (missingRequired.length <= 2 && baseScore >= 60) {
    tier = 'missing-few';
  } else {
    tier = 'explore';
  }

  // Map missing substitutes from recipe dataset
  const missingSubstitutes: { item: string; substitute: string }[] = [];
  for (const item of missingRequired) {
    // Find closest substitute key
    const subKey = Object.keys(recipe.substitutions).find(
      (k) => k.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(k.toLowerCase())
    );
    if (subKey && recipe.substitutions[subKey]) {
      missingSubstitutes.push({
        item,
        substitute: recipe.substitutions[subKey]
      });
    } else {
      missingSubstitutes.push({
        item,
        substitute: 'Can skip or substitute with common pantry alternatives'
      });
    }
  }

  return {
    recipe,
    baseScore,
    bonusScore,
    finalScore,
    tier,
    missingRequired,
    missingSubstitutes,
    matchedCount,
    totalRequired
  };
}

/**
 * Scores and sorts all recipes based on tier priority and final score
 */
export function scoreAndRankRecipes(
  recipes: Recipe[],
  pantryItems: PantryItem[],
  currentMealSlot: MealSlot,
  currentWeather: Weather,
  currentMood: Mood
): ScoredRecipe[] {
  const scored = recipes.map((recipe) =>
    scoreRecipe(recipe, pantryItems, currentMealSlot, currentWeather, currentMood)
  );

  return scored.sort((a, b) => {
    // Tier weight: ready (3) > missing-few (2) > explore (1)
    const tierWeight = { ready: 3, 'missing-few': 2, explore: 1 };
    if (tierWeight[a.tier] !== tierWeight[b.tier]) {
      return tierWeight[b.tier] - tierWeight[a.tier];
    }
    // Then by final score descending
    if (b.finalScore !== a.finalScore) {
      return b.finalScore - a.finalScore;
    }
    // Then by base score
    return b.baseScore - a.baseScore;
  });
}

/**
 * Auto-detects the current meal slot based on the local time of day
 */
export function detectAutoMealSlot(): MealSlot {
  const currentHour = new Date().getHours();
  // Breakfast: 6 AM - 11 AM
  if (currentHour >= 6 && currentHour < 11) {
    return 'Breakfast';
  }
  // Lunch: 11 AM - 3 PM (15:00)
  if (currentHour >= 11 && currentHour < 15) {
    return 'Lunch';
  }
  // Snacks / Tea Time: 3 PM - 6 PM (18:00)
  if (currentHour >= 15 && currentHour < 18) {
    return 'Snacks';
  }
  // Dinner: 6 PM - 11 PM (23:00)
  if (currentHour >= 18 && currentHour < 23) {
    return 'Dinner';
  }
  // Late night defaults to Snacks or Breakfast
  return 'Breakfast';
}
