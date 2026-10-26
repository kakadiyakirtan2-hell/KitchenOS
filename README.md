# 🍲 Mom’s Rasoi | Smart Kitchen Studio & Cooking Companion

A complete, responsive, standalone Single Page Application (SPA) designed as a personalized smart kitchen assistant for mothers. It algorithmically matches what to cook based on:
1. **Available pantry ingredients** (tracked locally in the Smart Digital Pantry).
2. **Current time of day** (auto-detected Breakfast, Lunch, Snacks/Chai, Dinner).
3. **Current weather condition** (☀️ Sunny/Hot, 🌧️ Rainy/Cool, ❄️ Chilly/Winter).
4. **Mom's current mood & energy level** (⚡ Quick & Easy, 🍲 Comfort Food, 🥗 Light & Healthy, 👩‍🍳 Weekend Special).
5. **Continuous Food Making** (Parallel multi-dish stove coordinator for simultaneous burner prep).
6. **Rasoi Video Studio** (Interactive 60fps canvas/SVG visual technique demonstrations with sound physics).

> **Pure Algorithmic Architecture**: Zero external LLMs, AI APIs, or vision libraries. 100% deterministic local structured matching and local persistence (`localStorage`).

---

## 🌟 Key Features

### 🥦 Feature A: The Smart Digital Pantry (My Kitchen Stock)
- **Categorized Ingredient Selector**: Grouped into clean visual tabs:
  - 🥦 *Veggies & Greens* (Potato, Onion, Tomato, Spinach, Paneer, Cauliflower, etc.)
  - 🌾 *Grains & Pulses* (Rice, Atta, Besan, Moong Dal, Toor Dal, Poha, Suji, etc.)
  - 🥛 *Dairy & Essentials* (Milk, Curd, Butter, Ghee, Cheese, Cooking Oil, etc.)
  - 🌶️ *Spices & Aromatics* (Cumin, Mustard, Turmeric, Red Chili, Garam Masala, Hing, etc.)
- **One-Tap Quick Select**: Instant toggle between "In Stock" and "Out of Stock".
- **Custom Ingredient Adder**: Add custom pantry items with category tags.
- **Auto-sync with `localStorage`**: Never loses state across app refreshes.

### 🕒 Feature B: The "What Should I Cook?" Context Engine
- **Meal Slot**: Auto-detects from the system clock with 1-tap manual override.
  - Breakfast (6 AM - 11 AM)
  - Lunch (11 AM - 3 PM)
  - Snacks / Chai Time (3 PM - 6 PM)
  - Dinner (6 PM - 11 PM)
- **Weather Selector**:
  - ☀️ *Sunny / Hot*: Prioritizes cooling, light dishes (Kadhi Pulao, Curd Rice, Upma).
  - 🌧️ *Rainy / Cool*: Prioritizes crispy snacks, pakoras, hot soups, khichdi.
  - ❄️ *Chilly / Winter*: Prioritizes rich, hearty flatbreads, ghee-rich curries, stews.
- **Mom's Mood & Energy Meter**:
  - ⚡ *Quick & Easy* (< 20 mins, minimal cleanup)
  - 🍲 *Comfort Food* (warm, soul-satisfying homestyle classics)
  - 🥗 *Light & Healthy* (low oil, high nutrition)
  - 👩‍🍳 *Weekend Special* (multi-step feast)

### 🧮 Feature C: Rule-Based Recipe Recommendation Scoring
- **Scoring Formula**:
  - `Base Score = (Count of available pantry ingredients matching required) / (Total required) * 100`
  - `Bonus Points`: +15% for matching meal slot; +10% for matching weather; +10% for matching mood.
- **Categorized Tiers**:
  - 🟢 **Ready to Cook!** (100% required ingredients available in pantry)
  - 🟡 **Missing Only 1-2 Items** (80-99% match, displays exact missing badges + home substitutes)
  - ⚪ **Explore Recipes** (all other categorized home favorites)

### 👩‍🍳 Feature D: Interactive Cooking Mode (Mom's Clean Kitchen Screen)
- **Distraction-Free Fullscreen View**: Large high-contrast text legible from across the counter.
- **Dynamic Serving Size Adjuster**: (2, 4, 6, 8 people) automatically scales ingredient quantities.
- **Embedded Visual Countdown Timers**: Clickable timer buttons with circular SVG countdown rings and gentle alarm chimes.
- **Voice Assistant**: Reads the active step out loud in a soothing voice using the Web Speech API.
- **Step-by-Step Checklist**: Tap anywhere on the card to check off steps with golden sparkles.
- **Completion Celebration**: Triggers celebratory confetti (`canvas-confetti`) with the greeting: *"Mom, your dish looks delicious!"*

### 📅 Feature E: Daily Meal Log & Favorite Notes
- **Daily Meal Journal**: Log cooked dishes with timestamp, meal slot, servings, and notes into calendar history.
- **Cooking Streak**: Keeps track of consecutive home-cooked days.
- **Mom's Secret Notes**: Save private recipe adjustments (*"Kids loved with extra cumin"*, *"Cook 2 whistles next time"*).

### 🍳 Special Addition 1: Continuous Food Making (Multi-Dish Stove Flow)
- **Parallel Stove Coordinator**: Queue 2 to 3 dishes simultaneously on Burner 1, Burner 2, and Burner 3 (e.g. Khichdi + Kadhi or Dal + Rice + Sabzi).
- **Parallel Stovetop Timers**: Active timers running side-by-side with sound alerts.
- **Giant Hands-Free Touch Navigation**: Extra-large touch targets designed for flour, dough, or oil-coated fingers.

### 🎥 Special Addition 2: Rasoi Video Studio (Interactive Cooking Technique Animations)
- Real-time 60fps canvas/SVG physics animations demonstrating authentic cooking cues:
  1. **Tadka Splutter & Sizzle**: Hot ghee, jumping mustard seeds popping with sparks, blooming cumin, curry leaves, rising steam.
  2. **Phulka & Paratha Steam Puffing**: Pale blisters, flip, 3D balloon puff on flame, golden crust, ghee brush.
  3. **Rolling Boil & Chai Decoction**: Crushed ginger, cardamom, tea swirl, rolling froth wave rise.
  4. **Crispy Dosa Spiral**: Concentric spiral ladle pour, butter drizzle, golden lace edge release.
  5. **Soft Atta Kneading Rhythm**: Squash and stretch rhythm, silky dough ball, finger dimple test.
  6. **Lump-Free Besan & Pakora Whisk**: Spinning whisk head, fluid vortex, ribbon consistency.
- Includes Play/Pause, Scrub Slider, 0.75x/1x/1.5x Speed, Synthesized Audio Sizzles, and 4 Golden Rules for Mom.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + warm kitchen design tokens
- **Typography**: Google Fonts (Poppins & Quicksand)
- **Icons**: Lucide Icons
- **Animation & Physics**: HTML5 Canvas 2D Engine + CSS Keyframes + `canvas-confetti`
- **Audio**: Web Audio API (Synthesized chimes, sizzles, bubbles, and timer alarms with zero external asset dependencies)
- **Voice**: Web Speech Synthesis API (`window.speechSynthesis`)
- **Persistence**: Structured `localStorage`

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
