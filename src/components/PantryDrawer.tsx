import React, { useState } from 'react';
import {
  X,
  Search,
  Plus,
  Check,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Trash2,
  Tag
} from 'lucide-react';
import { PantryItem, IngredientCategory } from '../types';
import { playChime } from '../utils/audio';

interface PantryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pantryItems: PantryItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: PantryItem) => void;
  onRemoveItem: (id: string) => void;
  onResetDefaults: () => void;
  onSelectAllCategory: (category: IngredientCategory | 'all', inStock: boolean) => void;
}

const CATEGORIES: { id: IngredientCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Items', icon: '🍲' },
  { id: 'veggies', label: 'Veggies & Greens', icon: '🥦' },
  { id: 'grains', label: 'Grains & Pulses', icon: '🌾' },
  { id: 'dairy', label: 'Dairy & Essentials', icon: '🥛' },
  { id: 'spices', label: 'Spices & Aromatics', icon: '🌶️' },
];

export const PantryDrawer: React.FC<PantryDrawerProps> = ({
  isOpen,
  onClose,
  pantryItems,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onResetDefaults,
  onSelectAllCategory
}) => {
  const [activeTab, setActiveTab] = useState<IngredientCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientCategory, setNewIngredientCategory] = useState<IngredientCategory>('veggies');

  if (!isOpen) return null;

  // Filter items
  const filteredItems = pantryItems.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.hindiName && item.hindiName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const totalInStock = pantryItems.filter((i) => i.inStock).length;

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim()) return;

    const id = `custom-${Date.now()}`;
    const newItem: PantryItem = {
      id,
      name: newIngredientName.trim(),
      category: newIngredientCategory,
      inStock: true,
      isCustom: true,
      icon: '✨'
    };

    onAddItem(newItem);
    playChime('high');
    setNewIngredientName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#FDFBF7] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#EBDDCF]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#E06D53] to-[#F59E0B] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-heading">
                  My Kitchen Pantry Stock
                </h2>
                <span className="bg-white/25 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {totalInStock} Available
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90">
                Tap items to toggle In-Stock / Out-of-Stock. Recipes match strictly to these!
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

        {/* Search & Category Tabs */}
        <div className="px-6 py-3.5 bg-[#F7F3EB] border-b border-[#EBDDCF] flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search potato, ghee, atta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#E8DEC8] text-xs sm:text-sm text-[#2D3142] focus:outline-none focus:border-[#E06D53]"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => onSelectAllCategory(activeTab, true)}
                className="px-3 py-1.5 rounded-xl bg-white text-[#588157] border border-[#588157]/30 hover:bg-[#588157]/10 text-xs font-bold transition-all cursor-pointer"
              >
                Mark All In Stock
              </button>
              <button
                onClick={() => onSelectAllCategory(activeTab, false)}
                className="px-3 py-1.5 rounded-xl bg-white text-[#7D7065] border border-[#E8DEC8] hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={onResetDefaults}
                className="p-1.5 rounded-xl bg-white text-gray-500 hover:text-[#E06D53] border border-[#E8DEC8] transition-all cursor-pointer"
                title="Restore Standard Staples"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {CATEGORIES.map((cat) => {
              const isSelected = activeTab === cat.id;
              const count =
                cat.id === 'all'
                  ? pantryItems.length
                  : pantryItems.filter((i) => i.category === cat.id).length;
              const inStockCount =
                cat.id === 'all'
                  ? pantryItems.filter((i) => i.inStock).length
                  : pantryItems.filter((i) => i.category === cat.id && i.inStock).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playChime('med');
                    setActiveTab(cat.id);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#E06D53] text-white shadow-md scale-102'
                      : 'bg-white text-[#2D3142]/80 hover:bg-white/80 border border-[#E8DEC8]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {inStockCount}/{count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ingredient Chips Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FDFBF7]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-[#7D7065]">
              <p className="text-3xl mb-2">🔍</p>
              <p className="font-bold text-sm">No ingredients found matching "{searchQuery}"</p>
              <p className="text-xs mt-1">Try adding it below as a custom item!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredItems.map((item) => {
                const inStock = item.inStock;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playChime(inStock ? 'low' : 'high');
                      onToggleItem(item.id);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between select-none active:scale-95 ${
                      inStock
                        ? 'bg-white border-[#588157] shadow-kitchen text-[#2D3142]'
                        : 'bg-[#F7F3EB]/60 border-dashed border-[#E8DEC8] text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xl shrink-0">{item.icon || '✨'}</span>
                      <div className="truncate text-left">
                        <p
                          className={`text-xs sm:text-sm font-bold truncate ${
                            inStock ? 'text-[#2D3142]' : 'text-gray-400'
                          }`}
                        >
                          {item.name}
                        </p>
                        {item.hindiName && (
                          <p className="text-[10px] text-gray-500 truncate">
                            {item.hindiName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          inStock
                            ? 'bg-[#588157] text-white shadow-xs'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {inStock && <Check className="w-3.5 h-3.5" />}
                      </div>

                      {item.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(item.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                          title="Delete custom item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Ingredient Adder Bar */}
        <form
          onSubmit={handleAddNewItem}
          className="p-4 bg-[#F7F3EB] border-t border-[#EBDDCF] flex flex-wrap sm:flex-nowrap items-center gap-2"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D3142] uppercase tracking-wider shrink-0">
            <Plus className="w-4 h-4 text-[#E06D53]" />
            <span>Add Custom:</span>
          </div>

          <input
            type="text"
            placeholder="Ingredient name (e.g. Baby Corn, Cashews, Saffron)..."
            value={newIngredientName}
            onChange={(e) => setNewIngredientName(e.target.value)}
            className="flex-1 min-w-[180px] px-3.5 py-2.5 bg-white rounded-xl border border-[#E8DEC8] text-xs sm:text-sm text-[#2D3142] focus:outline-none focus:border-[#E06D53]"
          />

          <select
            value={newIngredientCategory}
            onChange={(e) => setNewIngredientCategory(e.target.value as IngredientCategory)}
            className="px-3 py-2.5 bg-white rounded-xl border border-[#E8DEC8] text-xs font-bold text-[#2D3142] focus:outline-none focus:border-[#E06D53] cursor-pointer"
          >
            <option value="veggies">🥦 Veggies</option>
            <option value="grains">🌾 Grains</option>
            <option value="dairy">🥛 Dairy</option>
            <option value="spices">🌶️ Spices</option>
          </select>

          <button
            type="submit"
            disabled={!newIngredientName.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#E06D53] hover:bg-[#c9573f] disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer shrink-0"
          >
            Add to Pantry
          </button>
        </form>
      </div>
    </div>
  );
};
