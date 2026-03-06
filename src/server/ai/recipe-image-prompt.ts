import { RecipeTag } from "generated/gql/graphql";

/**
 * Recipe image generation prompt builder
 *
 * This module creates optimized prompts for generating beautiful,
 * professional food photography images using AI image generation.
 */

export interface RecipeImagePromptInput {
  recipeName: string;
  ingredients?: string[];
  tags?: RecipeTag[];
  servings?: number;
  instructions?: string;
}

// Map tags to style keywords for better image generation
// Using RecipeTag enum members as keys
const TAG_STYLE_MAP: Partial<Record<RecipeTag, string[]>> = {
  [RecipeTag.Vegetarian]: ["fresh vegetables", "colorful", "healthy"],
  [RecipeTag.Vegan]: ["plant-based", "fresh vegetables", "colorful"],
  [RecipeTag.GlutenFree]: ["clean presentation", "simple ingredients"],
  [RecipeTag.DairyFree]: ["dairy-free alternatives", "plant-based"],
  [RecipeTag.Quick]: ["simple presentation", "casual dining"],
  [RecipeTag.Easy]: ["home cooking", "simple", "casual"],
  [RecipeTag.Dessert]: ["sweet", "indulgent", "beautifully plated"],
  [RecipeTag.Snack]: ["bite-sized", "casual", "finger food"],
  [RecipeTag.Breakfast]: ["morning light", "cozy", "inviting"],
  [RecipeTag.Lunch]: ["fresh", "light", "midday"],
  [RecipeTag.Dinner]: ["warm lighting", "elegant", "dinner table"],
  [RecipeTag.Healthy]: ["fresh", "vibrant colors", "nutritious"],
  [RecipeTag.ComfortFood]: ["warm", "homey", "cozy"],
  [RecipeTag.LowCarb]: ["protein-focused", "minimal carbs", "healthy"],
  [RecipeTag.HighProtein]: ["protein-rich", "hearty", "satisfying"],
  [RecipeTag.Cheap]: ["home cooking", "simple", "casual"],
  [RecipeTag.Expensive]: ["fine dining", "artistic plating", "elegant"],
  [RecipeTag.Spicy]: ["vibrant", "bold colors", "chili garnish"],
  [RecipeTag.Sweet]: ["dessert-style", "elegant", "sweet"],
  [RecipeTag.Savory]: ["rich", "hearty", "flavorful"],
  [RecipeTag.Party]: ["festive", "colorful", "shareable"],
  [RecipeTag.KidsFriendly]: ["fun", "colorful", "appealing"],
  [RecipeTag.MealPrep]: ["organized", "containers", "batch cooking"],
  [RecipeTag.Favorite]: ["beautifully plated", "appetizing"],
  [RecipeTag.Delicious]: ["mouthwatering", "appetizing", "indulgent"],
};

// Base photography style for all recipe images
const BASE_STYLE = [
  "professional food photography",
  "appetizing",
  "high quality",
  "natural lighting",
  "shallow depth of field",
  "styled food presentation",
  "clean background",
  "top-down or 45-degree angle shot",
];

/**
 * Generate an optimized prompt for recipe image generation
 */
export function generateRecipeImagePrompt(
  input: RecipeImagePromptInput,
): string {
  const styleKeywords: string[] = [...BASE_STYLE];

  // Add tag-specific style keywords
  if (input.tags && input.tags.length > 0) {
    for (const tag of input.tags) {
      const tagStyles = TAG_STYLE_MAP[tag];
      if (tagStyles) {
        styleKeywords.push(...tagStyles);
      }
    }
  }

  // Extract key ingredients for the prompt (limit to top 5)
  const ingredientsList = input.ingredients
    ? input.ingredients.slice(0, 5).join(", ")
    : "";

  // Build the main subject description
  let subject = `A delicious ${input.recipeName}`;

  if (ingredientsList) {
    subject += ` featuring ${ingredientsList}`;
  }

  // Add serving context if available
  if (input.servings && input.servings > 1) {
    styleKeywords.push("family-style serving");
  } else {
    styleKeywords.push("single serving");
  }

  // Remove duplicates from style keywords
  const uniqueStyles = [...new Set(styleKeywords)];

  // Construct the final prompt
  const prompt = `${subject}. ${uniqueStyles.slice(0, 12).join(", ")}.`;

  return prompt;
}

/**
 * Generate a simple prompt based only on recipe name
 * Used when minimal information is available
 */
export function generateSimpleRecipePrompt(recipeName: string): string {
  return `A delicious ${recipeName}, ${BASE_STYLE.slice(0, 6).join(", ")}.`;
}
