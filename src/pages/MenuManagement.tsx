import { Plus, Search, Edit2, ToggleLeft, ToggleRight, X, Trash2, ChefHat, Settings2 } from "lucide-react";
import { useState } from "react";
import { useInventoryStore, type RecipeItem } from "@/stores/inventoryStore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  emoji: string;
};

const menuData: MenuItem[] = [
  { id: "1", name: "Nasi Goreng Special", category: "Main Course", price: 30000, available: true, emoji: "🍛" },
  { id: "2", name: "Ayam Bakar", category: "Main Course", price: 40000, available: true, emoji: "🍗" },
  { id: "3", name: "Mie Goreng", category: "Main Course", price: 25000, available: true, emoji: "🍝" },
  { id: "4", name: "Sate Ayam 10pcs", category: "Main Course", price: 35000, available: false, emoji: "🥘" },
  { id: "5", name: "Gado-Gado", category: "Appetizers", price: 22000, available: true, emoji: "🥗" },
  { id: "6", name: "Lumpia Goreng", category: "Appetizers", price: 15000, available: true, emoji: "🌯" },
  { id: "7", name: "Tahu Goreng", category: "Appetizers", price: 12000, available: true, emoji: "🧈" },
  { id: "8", name: "Es Teh Manis", category: "Drinks", price: 10000, available: true, emoji: "🧊" },
  { id: "9", name: "Jus Alpukat", category: "Drinks", price: 18000, available: true, emoji: "🥑" },
  { id: "10", name: "Kopi Susu", category: "Drinks", price: 20000, available: true, emoji: "☕" },
  { id: "11", name: "Es Jeruk", category: "Drinks", price: 12000, available: true, emoji: "🍊" },
  { id: "12", name: "Pisang Goreng", category: "Desserts", price: 15000, available: true, emoji: "🍌" },
  { id: "13", name: "Es Campur", category: "Desserts", price: 18000, available: true, emoji: "🍧" },
  { id: "14", name: "Kerupuk Udang", category: "Sides", price: 8000, available: true, emoji: "🦐" },
];

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

type EditingRecipe = {
  menuItemId: string;
  menuName: string;
  ingredients: RecipeItem[];
};

type EditMenuForm = {
  name: string;
  category: string;
  price: string;
  emoji: string;
};

export default function MenuManagement() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(menuData);
  const [editingRecipe, setEditingRecipe] = useState<EditingRecipe | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState<EditMenuForm>({ name: "", category: "", price: "", emoji: "" });
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof EditMenuForm, string>>>({});

  const { recipes, ingredients, addRecipe, removeRecipe, blockOnInsufficient, setBlockOnInsufficient } = useInventoryStore();

  const toggleAvailability = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, available: !i.available } : i)));
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const openRecipeEditor = (menuItem: MenuItem) => {
    const existing = recipes.find((r) => r.menuItemId === menuItem.id);
    setEditingRecipe({
      menuItemId: menuItem.id,
      menuName: menuItem.name,
      ingredients: existing ? [...existing.ingredients.map((i) => ({ ...i }))] : [],
    });
  };

  const openItemEditor = (item: MenuItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      emoji: item.emoji,
    });
    setEditErrors({});
  };

  const validateEditForm = () => {
    const errors: Partial<Record<keyof EditMenuForm, string>> = {};
    if (!editForm.name.trim()) errors.name = "Name is required";
    if (!editForm.category.trim()) errors.category = "Category is required";
    if (editForm.price.trim() === "") {
      errors.price = "Price is required";
    } else if (isNaN(Number(editForm.price)) || Number(editForm.price) < 0) {
      errors.price = "Price must be a valid positive number";
    }
    if (!editForm.emoji.trim()) errors.emoji = "Emoji is required";

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveItemEdit = () => {
    if (!editingItem) return;
    if (!validateEditForm()) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: editForm.name.trim(),
              category: editForm.category.trim(),
              price: Number(editForm.price),
              emoji: editForm.emoji.trim(),
            }
          : item
      )
    );

    toast({
      title: "Menu item updated",
      description: `${editForm.name.trim()} has been updated.`,
    });

    setEditingItem(null);
  };

  const addIngredientRow = () => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      ingredients: [...editingRecipe.ingredients, { ingredientId: "", qty: 0 }],
    });
  };

  const updateIngredientRow = (index: number, field: "ingredientId" | "qty", value: string | number) => {
    if (!editingRecipe) return;
    const updated = editingRecipe.ingredients.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setEditingRecipe({ ...editingRecipe, ingredients: updated });
  };

  const removeIngredientRow = (index: number) => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      ingredients: editingRecipe.ingredients.filter((_, i) => i !== index),
    });
  };

  const saveRecipe = () => {
    if (!editingRecipe) return;
    const valid = editingRecipe.ingredients.filter((i) => i.ingredientId && i.qty > 0);
    if (valid.length === 0) {
      removeRecipe(editingRecipe.menuItemId);
    } else {
      addRecipe(editingRecipe.menuItemId, valid);
    }
    setEditingRecipe(null);
  };

  const getRecipeCount = (menuItemId: string) => {
    const r = recipes.find((rec) => rec.menuItemId === menuItemId);
    return r ? r.ingredients.length : 0;
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-xs">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Block insufficient stock</span>
            <button onClick={() => setBlockOnInsufficient(!blockOnInsufficient)}>
              {blockOnInsufficient ? (
                <ToggleRight className="h-5 w-5 text-primary" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b bg-muted/30">
              <th className="p-4 font-medium">Item</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Recipe</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const recipeCount = getRecipeCount(item.id);
              return (
                <tr key={item.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{item.category}</td>
                  <td className="p-4 font-semibold text-foreground">{formatRp(item.price)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => openRecipeEditor(item)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        recipeCount > 0
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <ChefHat className="h-3 w-3" />
                      {recipeCount > 0 ? `${recipeCount} ingredients` : "No recipe"}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleAvailability(item.id)}>
                      {item.available ? (
                        <span className="flex items-center gap-1.5 text-success text-xs font-medium">
                          <ToggleRight className="h-5 w-5" /> Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          <ToggleLeft className="h-5 w-5" /> Unavailable
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => openItemEditor(item)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      aria-label={`Edit ${item.name}`}
                      title={`Edit ${item.name}`}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recipe Editor Modal */}
      <AnimatePresence>
        {editingRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setEditingRecipe(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" /> Recipe
                  </h2>
                  <p className="text-sm text-muted-foreground">{editingRecipe.menuName}</p>
                </div>
                <button onClick={() => setEditingRecipe(null)} className="p-2 rounded-lg hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {editingRecipe.ingredients.length === 0 && (
                  <div className="text-center py-8">
                    <ChefHat className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No ingredients yet</p>
                    <p className="text-xs text-muted-foreground/60">Add ingredients to track stock usage</p>
                  </div>
                )}

                {editingRecipe.ingredients.map((ri, index) => {
                  const selectedIng = ingredients.find((i) => i.id === ri.ingredientId);
                  return (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                      <div className="flex-1">
                        <select
                          value={ri.ingredientId}
                          onChange={(e) => updateIngredientRow(index, "ingredientId", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select ingredient...</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.stock} {ing.unit} left)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ri.qty || ""}
                          onChange={(e) => updateIngredientRow(index, "qty", parseFloat(e.target.value) || 0)}
                          placeholder="Qty"
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      {selectedIng && (
                        <span className="text-xs text-muted-foreground w-10 text-center">{selectedIng.unit}</span>
                      )}
                      <button
                        onClick={() => removeIngredientRow(index)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={addIngredientRow}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/30 text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Ingredient
                </button>
              </div>

              <div className="p-5 border-t border-border/50 flex gap-2">
                <button
                  onClick={() => setEditingRecipe(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRecipe}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Save Recipe
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Edit Menu Item</h2>
                  <p className="text-sm text-muted-foreground">Update item details</p>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-2 rounded-lg hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Item Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      editErrors.name ? "border-destructive" : "border-border"
                    }`}
                    placeholder="e.g. Nasi Goreng Special"
                  />
                  {editErrors.name && <p className="text-xs text-destructive">{editErrors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <input
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      editErrors.category ? "border-destructive" : "border-border"
                    }`}
                    placeholder="e.g. Main Course"
                  />
                  {editErrors.category && <p className="text-xs text-destructive">{editErrors.category}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Price</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        editErrors.price ? "border-destructive" : "border-border"
                      }`}
                      placeholder="0"
                    />
                    {editErrors.price && <p className="text-xs text-destructive">{editErrors.price}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Emoji</label>
                    <input
                      value={editForm.emoji}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, emoji: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        editErrors.emoji ? "border-destructive" : "border-border"
                      }`}
                      placeholder="🍛"
                    />
                    {editErrors.emoji && <p className="text-xs text-destructive">{editErrors.emoji}</p>}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-border/50 flex gap-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveItemEdit}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
