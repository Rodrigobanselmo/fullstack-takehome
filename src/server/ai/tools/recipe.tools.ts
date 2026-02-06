import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { IngredientCategory } from "generated/gql/graphql";

// Import services
import {
  getRecipesByUserId,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "~/graphql/recipe/recipe.services";
import {
  getIngredientsByUserId,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "~/graphql/ingredient/ingredient.services";
import {
  getRecipeGroupsByUserId,
  getRecipeGroupById,
  createRecipeGroup,
  updateRecipeGroup,
  deleteRecipeGroup,
  addRecipesToGroup,
} from "~/graphql/recipe-group/recipe-group.services";
import { ingredientRepository } from "~/server/repositories/ingredient.repository";
import { recipeGroupRepository } from "~/server/repositories/recipe-group.repository";

/**
 * Creates all recipe-related tools for a specific user context
 */
export function createRecipeTools(userId: string) {
  // ============ RECIPE TOOLS ============

  const listRecipesTool = tool(
    async () => {
      const recipes = await getRecipesByUserId({ userId });
      return JSON.stringify(recipes, null, 2);
    },
    {
      name: "list_recipes",
      description:
        "List all recipes for the current user. Returns an array of recipes with their id, name, servings, tags, rating, and prep time.",
      schema: z.object({}),
    },
  );

  const getRecipeTool = tool(
    async ({ recipeId }) => {
      try {
        const recipe = await getRecipeById({ recipeId, userId });
        return JSON.stringify(recipe, null, 2);
      } catch {
        return "Recipe not found";
      }
    },
    {
      name: "get_recipe",
      description: "Get a specific recipe by its ID",
      schema: z.object({
        recipeId: z.string().describe("The ID of the recipe to retrieve"),
      }),
    },
  );

  const createRecipeTool = tool(
    async ({ name, servings, ingredients, groupId }) => {
      try {
        // Create the recipe
        const recipe = await createRecipe({
          userId,
          input: {
            name,
            servings,
            ingredients: ingredients.map((ing) => ({
              ingredientId: ing.ingredientId,
              quantity: ing.quantity,
              unit: ing.unit,
            })),
          },
        });

        // Add to group
        await addRecipesToGroup({
          userId,
          input: {
            groupId,
            recipeIds: [recipe.id],
          },
        });

        return JSON.stringify(
          {
            message: `Recipe "${recipe.name}" created and added to group`,
            recipe,
            groupId,
          },
          null,
          2,
        );
      } catch (error) {
        return `Failed to create recipe: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
    {
      name: "create_recipe",
      description:
        "Create a new recipe and add it to a recipe group. IMPORTANT: Before calling this, use search_similar_ingredients to find existing ingredient IDs, or create_ingredient_with_embedding to create new ones. You must specify a groupId to add the recipe to.",
      schema: z.object({
        name: z.string().describe("Name of the recipe"),
        servings: z.number().describe("Number of servings"),
        groupId: z
          .string()
          .describe(
            "ID of the recipe group to add this recipe to (use list_recipe_groups to find existing groups or create_recipe_group to create one)",
          ),
        ingredients: z
          .array(
            z.object({
              ingredientId: z
                .string()
                .describe(
                  "The ID of an existing ingredient (use search_similar_ingredients to find or create_ingredient_with_embedding to create)",
                ),
              quantity: z.number().describe("Quantity of the ingredient"),
              unit: z
                .string()
                .describe(
                  "Unit of measurement (e.g., 'cups', 'grams', 'pieces')",
                ),
            }),
          )
          .describe("List of ingredients with their IDs"),
      }),
    },
  );

  const updateRecipeTool = tool(
    async ({ recipeId, name, servings, ingredients, groupIds }) => {
      try {
        const recipe = await updateRecipe({
          userId,
          recipeId,
          input: {
            name,
            servings,
            ingredients: ingredients?.map((ing) => ({
              ingredientId: ing.ingredientId,
              quantity: ing.quantity,
              unit: ing.unit,
            })),
          },
        });

        // Update group associations if provided
        if (groupIds) {
          if (groupIds.length === 0) {
            return "Failed to update recipe: Recipe must belong to at least one group.";
          }
          await recipeGroupRepository.setGroupsForRecipe({
            recipeId,
            userId,
            groupIds,
          });
        }

        return JSON.stringify(
          {
            recipe,
            ...(groupIds && { groupIds }),
          },
          null,
          2,
        );
      } catch (error) {
        return `Failed to update recipe: ${error instanceof Error ? error.message : "Recipe may not exist."}`;
      }
    },
    {
      name: "update_recipe",
      description:
        "Update an existing recipe. All fields are optional. Use groupIds to set which groups this recipe belongs to (replaces all current group associations). IMPORTANT: If updating ingredients, use search_similar_ingredients first to find ingredient IDs.",
      schema: z.object({
        recipeId: z.string().describe("The ID of the recipe to update"),
        name: z.string().optional().describe("New name for the recipe"),
        servings: z.number().optional().describe("New number of servings"),
        groupIds: z
          .array(z.string())
          .optional()
          .describe(
            "List of group IDs this recipe should belong to (replaces all current groups). Must have at least one group.",
          ),
        ingredients: z
          .array(
            z.object({
              ingredientId: z
                .string()
                .describe("The ID of an existing ingredient"),
              quantity: z.number().describe("Quantity of the ingredient"),
              unit: z.string().describe("Unit of measurement"),
            }),
          )
          .optional()
          .describe(
            "New list of ingredients with IDs (replaces all existing ingredients)",
          ),
      }),
    },
  );

  const deleteRecipeTool = tool(
    async ({ recipeId }) => {
      try {
        await deleteRecipe({ userId, recipeId });
        return "Recipe deleted successfully";
      } catch {
        return "Failed to delete recipe. Recipe may not exist.";
      }
    },
    {
      name: "delete_recipe",
      description: "Delete a recipe by its ID",
      schema: z.object({
        recipeId: z.string().describe("The ID of the recipe to delete"),
      }),
    },
  );

  // ============ INGREDIENT TOOLS ============

  const listIngredientsTool = tool(
    async ({ first, after }) => {
      const connection = await getIngredientsByUserId({
        userId,
        first: first ?? 100,
        after,
      });
      return JSON.stringify(
        {
          ingredients: connection.edges.map((e) => e.node),
          pageInfo: connection.pageInfo,
          total: connection.edges.length,
        },
        null,
        2,
      );
    },
    {
      name: "list_ingredients",
      description:
        "List ingredients for the current user with pagination. Returns ingredients with their id, name, description, category, default unit, and price info. Use 'after' cursor for pagination.",
      schema: z.object({
        first: z
          .number()
          .optional()
          .describe("Number of ingredients to return (default: 100)"),
        after: z
          .string()
          .optional()
          .describe(
            "Cursor for pagination - use endCursor from previous response",
          ),
      }),
    },
  );

  const getIngredientTool = tool(
    async ({ ingredientId }) => {
      try {
        const ingredient = await getIngredientById({ ingredientId, userId });
        return JSON.stringify(ingredient, null, 2);
      } catch {
        return "Ingredient not found";
      }
    },
    {
      name: "get_ingredient",
      description: "Get a specific ingredient by its ID",
      schema: z.object({
        ingredientId: z
          .string()
          .describe("The ID of the ingredient to retrieve"),
      }),
    },
  );

  const createIngredientTool = tool(
    async ({
      name,
      description,
      categories,
      defaultUnit,
      averagePrice,
      priceUnit,
      priceCurrency,
    }) => {
      const ingredient = await createIngredient({
        userId,
        input: {
          name,
          description,
          categories: categories as IngredientCategory[] | undefined,
          defaultUnit,
          averagePrice,
          priceUnit,
          priceCurrency,
        },
      });
      return JSON.stringify(ingredient, null, 2);
    },
    {
      name: "create_ingredient",
      description:
        "Create a new ingredient. This creates a user-specific ingredient.",
      schema: z.object({
        name: z.string().describe("Name of the ingredient"),
        description: z
          .string()
          .optional()
          .describe("Description of the ingredient"),
        categories: z
          .array(z.nativeEnum(IngredientCategory))
          .optional()
          .describe("Categories for the ingredient"),
        defaultUnit: z
          .string()
          .optional()
          .describe("Default unit of measurement"),
        averagePrice: z
          .number()
          .optional()
          .describe("Average price of the ingredient"),
        priceUnit: z
          .string()
          .optional()
          .describe("Unit for the price (e.g., 'kg', 'unit')"),
        priceCurrency: z
          .string()
          .optional()
          .describe("Currency for the price (e.g., 'USD', 'BRL')"),
      }),
    },
  );

  const updateIngredientTool = tool(
    async ({
      ingredientId,
      name,
      description,
      categories,
      defaultUnit,
      averagePrice,
      priceUnit,
      priceCurrency,
    }) => {
      try {
        const ingredient = await updateIngredient({
          userId,
          ingredientId,
          input: {
            name,
            description,
            categories: categories as IngredientCategory[] | undefined,
            defaultUnit,
            averagePrice,
            priceUnit,
            priceCurrency,
          },
        });
        return JSON.stringify(ingredient, null, 2);
      } catch {
        return "Failed to update ingredient. Ingredient may not exist.";
      }
    },
    {
      name: "update_ingredient",
      description:
        "Update an existing ingredient. All fields are optional. Note: If updating a system ingredient, a user-specific copy will be created automatically.",
      schema: z.object({
        ingredientId: z.string().describe("The ID of the ingredient to update"),
        name: z.string().optional().describe("New name for the ingredient"),
        description: z.string().optional().describe("New description"),
        categories: z
          .array(
            z.enum([
              "VEGETABLES",
              "FRUITS",
              "GRAINS",
              "PROTEINS",
              "DAIRY",
              "OILS_FATS",
              "SPICES_HERBS",
              "CONDIMENTS",
              "BAKING",
              "BEVERAGES",
              "SNACKS",
              "FROZEN",
              "CANNED",
              "PASTA_NOODLES",
              "NUTS_SEEDS",
              "SWEETENERS",
              "OTHER",
            ]),
          )
          .optional()
          .describe("New categories array"),
        defaultUnit: z.string().optional().describe("New default unit"),
        averagePrice: z.number().optional().describe("New average price"),
        priceUnit: z.string().optional().describe("New price unit"),
        priceCurrency: z.string().optional().describe("New price currency"),
      }),
    },
  );

  const deleteIngredientTool = tool(
    async ({ ingredientId }) => {
      try {
        await deleteIngredient({ userId, ingredientId });
        return "Ingredient deleted successfully";
      } catch {
        return "Failed to delete ingredient. Ingredient may not exist or is a system ingredient (cannot be deleted).";
      }
    },
    {
      name: "delete_ingredient",
      description:
        "Delete an ingredient by its ID. Note: System ingredients cannot be deleted.",
      schema: z.object({
        ingredientId: z.string().describe("The ID of the ingredient to delete"),
      }),
    },
  );

  // ============ RECIPE GROUP TOOLS ============

  const listRecipeGroupsTool = tool(
    async () => {
      const groups = await getRecipeGroupsByUserId({ userId });
      return JSON.stringify(groups, null, 2);
    },
    {
      name: "list_recipe_groups",
      description:
        "List all recipe groups for the current user. Recipe groups are collections of recipes.",
      schema: z.object({}),
    },
  );

  const getRecipeGroupTool = tool(
    async ({ groupId }) => {
      try {
        const group = await getRecipeGroupById({ groupId, userId });
        return JSON.stringify(group, null, 2);
      } catch {
        return "Recipe group not found";
      }
    },
    {
      name: "get_recipe_group",
      description: "Get a specific recipe group by its ID",
      schema: z.object({
        groupId: z.string().describe("The ID of the recipe group to retrieve"),
      }),
    },
  );

  const createRecipeGroupTool = tool(
    async ({ name, description, recipeIds }) => {
      const group = await createRecipeGroup({
        userId,
        input: { name, description, recipeIds },
      });
      return JSON.stringify(group, null, 2);
    },
    {
      name: "create_recipe_group",
      description: "Create a new recipe group (collection of recipes)",
      schema: z.object({
        name: z.string().describe("Name of the recipe group"),
        description: z.string().optional().describe("Description of the group"),
        recipeIds: z
          .array(z.string())
          .optional()
          .describe("Initial list of recipe IDs to add to the group"),
      }),
    },
  );

  const updateRecipeGroupTool = tool(
    async ({ groupId, name, description }) => {
      try {
        const group = await updateRecipeGroup({
          userId,
          groupId,
          input: { name, description },
        });
        return JSON.stringify(group, null, 2);
      } catch {
        return "Failed to update recipe group. Group may not exist.";
      }
    },
    {
      name: "update_recipe_group",
      description: "Update an existing recipe group. All fields are optional.",
      schema: z.object({
        groupId: z.string().describe("The ID of the recipe group to update"),
        name: z.string().optional().describe("New name for the group"),
        description: z.string().optional().describe("New description"),
      }),
    },
  );

  const deleteRecipeGroupTool = tool(
    async ({ groupId }) => {
      try {
        await deleteRecipeGroup({ userId, groupId });
        return "Recipe group deleted successfully";
      } catch {
        return "Failed to delete recipe group. Group may not exist.";
      }
    },
    {
      name: "delete_recipe_group",
      description: "Delete a recipe group by its ID",
      schema: z.object({
        groupId: z.string().describe("The ID of the recipe group to delete"),
      }),
    },
  );

  // ============ SMART INGREDIENT SEARCH TOOLS ============

  const searchSimilarIngredientsTool = tool(
    async ({ ingredientName, limit }) => {
      try {
        const results = await ingredientRepository.findSimilarByName({
          userId,
          name: ingredientName,
          limit: limit ?? 5,
        });
        if (results.length === 0) {
          return JSON.stringify({
            message: `No similar ingredients found for "${ingredientName}". You should create a new ingredient using create_ingredient.`,
            searchTerm: ingredientName,
            results: [],
          });
        }
        return JSON.stringify(
          {
            searchTerm: ingredientName,
            results: results.map((r) => ({
              id: r.id,
              name: r.name,
              distance: r.distance.toFixed(4),
            })),
            hint: "Lower distance = more similar. If none match well, use create_ingredient to create a new one.",
          },
          null,
          2,
        );
      } catch (error) {
        return `Failed to search ingredients: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
    {
      name: "search_similar_ingredients",
      description:
        "Search for existing ingredients by name using vector similarity. Returns the most similar ingredients. Use this BEFORE creating a recipe to find ingredient IDs. If no good match is found, use create_ingredient to create a new ingredient.",
      schema: z.object({
        ingredientName: z
          .string()
          .describe("The ingredient name to search for"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of results to return (default: 5)"),
      }),
    },
  );

  // Return all tools
  return [
    // Recipe tools
    listRecipesTool,
    getRecipeTool,
    createRecipeTool,
    updateRecipeTool,
    deleteRecipeTool,
    // Ingredient tools
    listIngredientsTool,
    getIngredientTool,
    createIngredientTool,
    updateIngredientTool,
    deleteIngredientTool,
    // Smart ingredient search tool
    searchSimilarIngredientsTool,
    // Recipe group tools
    listRecipeGroupsTool,
    getRecipeGroupTool,
    createRecipeGroupTool,
    updateRecipeGroupTool,
    deleteRecipeGroupTool,
  ];
}
