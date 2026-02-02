import { IngredientCategory } from "generated/gql/graphql";

export const INGREDIENT_CATEGORY_MAP: Record<
  IngredientCategory,
  { label: string; emoji: string }
> = {
  [IngredientCategory.Vegetables]: { label: "Vegetables", emoji: "🥬" },
  [IngredientCategory.Fruits]: { label: "Fruits", emoji: "🍎" },
  [IngredientCategory.Grains]: { label: "Grains", emoji: "🌾" },
  [IngredientCategory.Proteins]: { label: "Proteins", emoji: "🍗" },
  [IngredientCategory.Dairy]: { label: "Dairy", emoji: "🥛" },
  [IngredientCategory.OilsFats]: { label: "Oils & Fats", emoji: "🫒" },
  [IngredientCategory.SpicesHerbs]: { label: "Spices & Herbs", emoji: "🌿" },
  [IngredientCategory.Condiments]: { label: "Condiments", emoji: "🍯" },
  [IngredientCategory.Baking]: { label: "Baking", emoji: "🧁" },
  [IngredientCategory.Beverages]: { label: "Beverages", emoji: "☕" },
  [IngredientCategory.Snacks]: { label: "Snacks", emoji: "🍿" },
  [IngredientCategory.Frozen]: { label: "Frozen", emoji: "🧊" },
  [IngredientCategory.Canned]: { label: "Canned", emoji: "🥫" },
  [IngredientCategory.PastaNoodles]: { label: "Pasta & Noodles", emoji: "🍝" },
  [IngredientCategory.NutsSeeds]: { label: "Nuts & Seeds", emoji: "🥜" },
  [IngredientCategory.Sweeteners]: { label: "Sweeteners", emoji: "🍯" },
  [IngredientCategory.Other]: { label: "Other", emoji: "📦" },
};

export const INGREDIENT_CATEGORY_OPTIONS = Object.entries(
  INGREDIENT_CATEGORY_MAP,
).map(([value, { label, emoji }]) => ({
  value,
  label: `${emoji} ${label}`,
}));
