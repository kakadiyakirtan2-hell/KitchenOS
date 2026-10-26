import React, { useState } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Heart,
  Trash2,
  Clock,
  Plus
} from 'lucide-react';
import { MealJournalEntry, RecipeNote, Recipe, MealSlot } from '../types';
import { playChime } from '../utils/audio';

interface MealJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: MealJournalEntry[];
  recipeNotes: Record<string, RecipeNote>;
  recipes: Recipe[];
  onDeleteJournalEntry: (id: string) => void;
  onAddManualEntry: (entry: Omit<MealJournalEntry, 'id' | 'timestamp'>) => void;
  onSaveNote: (note: RecipeNote) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const MealJournalModal: React.FC<MealJournalModalProps> = ({
  isOpen,
  onClose,
  journalEntries,
  recipeNotes,
  recipes,
  onDeleteJournalEntry,
  onAddManualEntry,
  onSaveNote,
  onSelectRecipe
}) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'notes'>('journal');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('Dinner');
  const [noteText, setNoteText] = useState('');
  const [servingsCooked, setServingsCooked] = useState(4);

  if (!isOpen) return null;

  // Calculate home cooking stats
  const totalCooked = journalEntries.length;

  // Calculate streak: unique days cooked
  const uniqueDates = Array.from(new Set(journalEntries.map((e) => e.date)));
  const streakDays = Math.max(1, uniqueDates.length);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    if (!recipe) return;

    onAddManualEntry({
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      cuisine: recipe.cuisine,
      mealSlot: selectedSlot,
      date: new Date().toISOString().split('T')[0],
      note: noteText,
      rating: 5,
      servings: servingsCooked
    });

    playChime('high');
    setShowAddForm(false);
    setNoteText('');
  };

  const favoriteNotesList = Object.values(recipeNotes).filter(
    (n) => n.isFavorite || n.note.trim().length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#FDFBF7] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#EBDDCF]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-heading">
                  Mom’s Kitchen Diary & Notes
                </h2>
                <span className="bg-white/25 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {streakDays} Days Cooking Streak! 🔥
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90">
                Track family meal history and Mom’s secret culinary notes
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playChime('low');
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="px-6 py-3 bg-[#F7F3EB] border-b border-[#EBDDCF] grid grid-cols-3 gap-3">
          <div className="p-2.5 bg-white rounded-2xl border border-[#E8DEC8] flex items-center gap-2.5">
            <span className="text-2xl">🍲</span>
            <div>
              <p className="text-[11px] text-[#7D7065] font-medium">Total Meals</p>
              <p className="text-base font-bold text-[#2D3142]">{totalCooked} Prepared</p>
            </div>
          </div>
          <div className="p-2.5 bg-white rounded-2xl border border-[#E8DEC8] flex items-center gap-2.5">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-[11px] text-[#7D7065] font-medium">Home Cook Streak</p>
              <p className="text-base font-bold text-[#E06D53]">{streakDays} Days</p>
            </div>
          </div>
          <div className="p-2.5 bg-white rounded-2xl border border-[#E8DEC8] flex items-center gap-2.5">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-[11px] text-[#7D7065] font-medium">Mom's Secret Notes</p>
              <p className="text-base font-bold text-[#588157]">{favoriteNotesList.length} Notes</p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="px-6 py-2.5 bg-white border-b border-[#EBDDCF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playChime('med');
                setActiveTab('journal');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-[#E06D53] text-white shadow-xs'
                  : 'bg-gray-100 text-[#7D7065] hover:bg-gray-200'
              }`}
            >
              📅 Daily Meal Journal ({journalEntries.length})
            </button>
            <button
              onClick={() => {
                playChime('med');
                setActiveTab('notes');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-[#E06D53] text-white shadow-xs'
                  : 'bg-gray-100 text-[#7D7065] hover:bg-gray-200'
              }`}
            >
              ❤️ Mom’s Secret Notes ({favoriteNotesList.length})
            </button>
          </div>

          {activeTab === 'journal' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-[#588157] hover:bg-[#466945] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log a Dish</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FDFBF7]">
          {/* Add Entry Quick Form */}
          {showAddForm && activeTab === 'journal' && (
            <form
              onSubmit={handleManualSubmit}
              className="mb-6 p-4 bg-white rounded-3xl border-2 border-[#E06D53]/40 shadow-kitchen flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#E06D53]">
                  Log What Mom Cooked Today:
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#7D7065] block mb-1">
                    Select Dish:
                  </label>
                  <select
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    className="w-full p-2 bg-[#F7F3EB] rounded-xl border border-[#E8DEC8] text-xs font-bold text-[#2D3142]"
                  >
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#7D7065] block mb-1">
                    Meal Slot:
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value as MealSlot)}
                    className="w-full p-2 bg-[#F7F3EB] rounded-xl border border-[#E8DEC8] text-xs font-bold text-[#2D3142]"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks / Chai</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#7D7065] block mb-1">
                    Servings Cooked:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={servingsCooked}
                    onChange={(e) => setServingsCooked(parseInt(e.target.value) || 4)}
                    className="w-full p-2 bg-[#F7F3EB] rounded-xl border border-[#E8DEC8] text-xs font-bold text-[#2D3142]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#7D7065] block mb-1">
                  Mom's Note (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g., Everyone went for seconds; extra lemon on top!"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-2 bg-[#F7F3EB] rounded-xl border border-[#E8DEC8] text-xs text-[#2D3142]"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 rounded-xl bg-[#E06D53] text-white font-bold text-xs shadow-xs hover:bg-[#c9573f] transition-all cursor-pointer"
              >
                Save in Diary
              </button>
            </form>
          )}

          {/* Tab 1: Daily Journal Timeline */}
          {activeTab === 'journal' && (
            <div className="space-y-3">
              {journalEntries.length === 0 ? (
                <div className="text-center py-12 text-[#7D7065]">
                  <p className="text-3xl mb-2">📖</p>
                  <p className="font-bold text-sm">Mom’s diary is empty so far</p>
                  <p className="text-xs mt-1">
                    Click "Cooked This Today" inside any recipe to start recording your meal history!
                  </p>
                </div>
              ) : (
                journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-white rounded-2xl border border-[#EBDDCF] shadow-xs flex items-start justify-between gap-3 hover:border-[#E06D53] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#E06D53]/10 text-[#E06D53] shrink-0 mt-0.5">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-[#2D3142] font-heading">
                            {entry.recipeTitle}
                          </h4>
                          <span className="text-[10px] bg-[#588157]/15 text-[#588157] font-bold px-2 py-0.5 rounded-full">
                            {entry.mealSlot}
                          </span>
                        </div>
                        <p className="text-xs text-[#7D7065] mt-0.5">
                          {entry.date} • {entry.servings} Servings • {entry.cuisine}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-[#5C3B1E] bg-[#FFF9F2] p-2 rounded-xl border border-[#F5D8BA] mt-2 italic">
                            "{entry.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteJournalEntry(entry.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Delete journal entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Mom's Secret Recipe Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              {favoriteNotesList.length === 0 ? (
                <div className="text-center py-12 text-[#7D7065]">
                  <p className="text-3xl mb-2">💡</p>
                  <p className="font-bold text-sm">No personal notes saved yet</p>
                  <p className="text-xs mt-1">
                    When you finish cooking a dish, add notes like "Cook 2 whistles" or "Needs 1/2 tsp less chili" to save them here!
                  </p>
                </div>
              ) : (
                favoriteNotesList.map((note) => {
                  const rec = recipes.find((r) => r.id === note.recipeId);
                  return (
                    <div
                      key={note.recipeId}
                      className="p-4 bg-white rounded-2xl border border-[#EBDDCF] shadow-xs flex items-start justify-between gap-3 hover:border-[#E06D53] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{rec?.emoji || '🍲'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              onClick={() => {
                                if (rec) {
                                  onClose();
                                  onSelectRecipe(rec);
                                }
                              }}
                              className="text-sm sm:text-base font-bold text-[#2D3142] font-heading hover:text-[#E06D53] cursor-pointer"
                            >
                              {rec ? rec.title : note.recipeId}
                            </h4>
                            <span className="text-xs">
                              {'⭐'.repeat(note.rating || 5)}
                            </span>
                          </div>
                          {note.note && (
                            <p className="text-xs sm:text-sm text-[#4A4E69] mt-1.5 font-medium leading-relaxed bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E8DEC8]">
                              "{note.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      {rec && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectRecipe(rec);
                          }}
                          className="px-3 py-1 rounded-xl bg-[#F7F3EB] hover:bg-[#EBDDCF] text-xs font-bold text-[#2D3142] shrink-0 cursor-pointer"
                        >
                          View Dish
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
