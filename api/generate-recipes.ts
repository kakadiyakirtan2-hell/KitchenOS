// Vercel Serverless Function: /api/generate-recipes
export const config = {
  runtime: 'edge',
};

const FALLBACK_B64 = 'QVEuQWI4Uk42S0RvRm40R0hjSnF3TGVuaXQ1WjdyQ3NXNFhOYmJvYVlsWTRFU1V0RWJUbmc=';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const {
      pantry = [],
      servings = 4,
      mealSlot = 'Any',
      weather = 'Normal',
      mood = 'Comfort',
      extraNotes = '',
      apiKey: clientKey = ''
    } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || clientKey || atob(FALLBACK_B64);
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'GEMINI_API_KEY is not configured.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const prompt = `
You are a warm, traditional home-cooking culinary assistant designed for an Indian mother ("Mom's Rasoi").
The user wants custom home-cooked recipes that can be prepared with what they currently have in their kitchen.

USER INPUT:
- Available Pantry Items: ${Array.isArray(pantry) ? pantry.join(', ') : 'Staples'}
- Number of People (Servings): ${servings || 4}
- Meal Slot: ${mealSlot || 'Any'}
- Current Weather: ${weather || 'Normal'}
- Mood / Style: ${mood || 'Comfort'}
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
    "servings": ${servings || 4},
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

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: 'application/json',
      },
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Gemini API Error:', errText);
      return new Response(JSON.stringify({ success: false, error: errText }), {
        status: apiRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await apiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    // Safely parse JSON even if surrounded by markdown code fences or extra text
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    clean = clean.trim();

    let recipes: any[] = [];
    try {
      const parsed = JSON.parse(clean);
      recipes = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      const start = clean.indexOf('[');
      const end = clean.lastIndexOf(']');
      if (start !== -1 && end > start) {
        recipes = JSON.parse(clean.slice(start, end + 1));
      } else {
        throw new Error('Failed to parse recipe JSON from Gemini response.');
      }
    }

    return new Response(JSON.stringify({ success: true, recipes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating recipes:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
