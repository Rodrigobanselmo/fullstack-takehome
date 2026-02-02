import { RecipeTag } from "generated/gql/graphql";

export const RECIPE_TAG_MAP: Record<
  RecipeTag,
  { label: string; emoji: string }
> = {
  [RecipeTag.Favorite]: { label: "Favorite", emoji: "⭐" },
  [RecipeTag.Healthy]: { label: "Healthy", emoji: "🥗" },
  [RecipeTag.Quick]: { label: "Quick", emoji: "⚡" },
  [RecipeTag.Easy]: { label: "Easy", emoji: "👍" },
  [RecipeTag.Cheap]: { label: "Cheap", emoji: "💰" },
  [RecipeTag.Expensive]: { label: "Expensive", emoji: "💎" },
  [RecipeTag.Delicious]: { label: "Delicious", emoji: "😋" },
  [RecipeTag.ComfortFood]: { label: "Comfort Food", emoji: "🛋️" },
  [RecipeTag.Vegetarian]: { label: "Vegetarian", emoji: "🥕" },
  [RecipeTag.Vegan]: { label: "Vegan", emoji: "🌱" },
  [RecipeTag.GlutenFree]: { label: "Gluten Free", emoji: "🌾" },
  [RecipeTag.DairyFree]: { label: "Dairy Free", emoji: "🥛" },
  [RecipeTag.LowCarb]: { label: "Low Carb", emoji: "🥩" },
  [RecipeTag.HighProtein]: { label: "High Protein", emoji: "💪" },
  [RecipeTag.Spicy]: { label: "Spicy", emoji: "🌶️" },
  [RecipeTag.Sweet]: { label: "Sweet", emoji: "🍰" },
  [RecipeTag.Savory]: { label: "Savory", emoji: "🧂" },
  [RecipeTag.Breakfast]: { label: "Breakfast", emoji: "🍳" },
  [RecipeTag.Lunch]: { label: "Lunch", emoji: "🥪" },
  [RecipeTag.Dinner]: { label: "Dinner", emoji: "🍽️" },
  [RecipeTag.Snack]: { label: "Snack", emoji: "🍿" },
  [RecipeTag.Dessert]: { label: "Dessert", emoji: "🍨" },
  [RecipeTag.Party]: { label: "Party", emoji: "🎉" },
  [RecipeTag.KidsFriendly]: { label: "Kids Friendly", emoji: "👶" },
  [RecipeTag.MealPrep]: { label: "Meal Prep", emoji: "📦" },
};

export const RECIPE_TAG_OPTIONS = Object.entries(RECIPE_TAG_MAP).map(
  ([value, { label, emoji }]) => ({
    value,
    label: `${emoji} ${label}`,
  }),
);
