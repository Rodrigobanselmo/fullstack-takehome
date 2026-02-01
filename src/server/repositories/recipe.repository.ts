import type { Recipe, RecipeIngredient, RecipeTag } from "generated/gql/graphql";
import { getPrismaClient } from "~/server/database/transaction";

// Scalar entity without nested relations (ingredients will be loaded by field resolver)
export type RecipeEntity = Omit<Recipe, "ingredients">;

// RecipeIngredient entity without the nested ingredient object (will be loaded by field resolver)
export type RecipeIngredientEntity = Omit<RecipeIngredient, "ingredient">;

export interface RecipeIngredientData {
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
  optional?: boolean;
}

export interface CreateRecipeData {
  name: string;
  servings: number;
  userId: string;
  tags?: string[];
  overallRating?: number;
  prepTimeMinutes?: number;
  ingredients: RecipeIngredientData[];
}

export interface UpdateRecipeData {
  recipeId: string;
  userId: string;
  name?: string;
  servings?: number;
  tags?: string[];
  overallRating?: number;
  prepTimeMinutes?: number;
  ingredients?: RecipeIngredientData[];
}

class PrismaRecipeRepository {
  async findManyByUserId({ userId }: { userId: string }): Promise<RecipeEntity[]> {
    const db = getPrismaClient();
    const recipes = await db.recipes.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      tags: recipe.tags as RecipeTag[],
      overallRating: recipe.overallRating ?? undefined,
      prepTimeMinutes: recipe.prepTimeMinutes ?? undefined,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    }));
  }

  async findById({ recipeId, userId }: { recipeId: string; userId: string }): Promise<RecipeEntity | null> {
    const db = getPrismaClient();
    const recipe = await db.recipes.findFirst({
      where: {
        id: recipeId,
        userId,
        deletedAt: null,
      },
    });

    if (!recipe) {
      return null;
    }

    return {
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      tags: recipe.tags as RecipeTag[],
      overallRating: recipe.overallRating ?? undefined,
      prepTimeMinutes: recipe.prepTimeMinutes ?? undefined,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }

  async create(data: CreateRecipeData): Promise<RecipeEntity> {
    const db = getPrismaClient();

    const recipe = await db.recipes.create({
      data: {
        name: data.name,
        servings: data.servings,
        userId: data.userId,
        tags: data.tags ?? [],
        overallRating: data.overallRating,
        prepTimeMinutes: data.prepTimeMinutes,
        recipeIngredients: {
          create: data.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes,
            optional: ing.optional ?? false,
          })),
        },
      },
    });

    return {
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      tags: recipe.tags as RecipeTag[],
      overallRating: recipe.overallRating ?? undefined,
      prepTimeMinutes: recipe.prepTimeMinutes ?? undefined,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }

  async update(data: UpdateRecipeData): Promise<RecipeEntity> {
    const db = getPrismaClient();

    const recipe = await db.recipes.update({
      where: { id: data.recipeId, userId: data.userId },
      data: {
        name: data.name,
        servings: data.servings,
        tags: data.tags,
        overallRating: data.overallRating,
        prepTimeMinutes: data.prepTimeMinutes,
        updatedAt: new Date(),
        ...(data.ingredients && {
          recipeIngredients: {
            deleteMany: {},
            create: data.ingredients.map((ing) => ({
              ingredientId: ing.ingredientId,
              quantity: ing.quantity,
              unit: ing.unit,
              notes: ing.notes,
              optional: ing.optional ?? false,
            })),
          },
        }),
      },
    });

    return {
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      tags: recipe.tags as RecipeTag[],
      overallRating: recipe.overallRating ?? undefined,
      prepTimeMinutes: recipe.prepTimeMinutes ?? undefined,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }

  async softDelete({ recipeId, userId }: { recipeId: string; userId: string }): Promise<RecipeEntity> {
    const db = getPrismaClient();
    const recipe = await db.recipes.update({
      where: { id: recipeId, userId },
      data: { deletedAt: new Date() },
    });

    return {
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      tags: recipe.tags as RecipeTag[],
      overallRating: recipe.overallRating ?? undefined,
      prepTimeMinutes: recipe.prepTimeMinutes ?? undefined,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }

  // File relations
  async attachFileToRecipe({ recipeId, fileId }: { recipeId: string; fileId: string }): Promise<void> {
    const db = getPrismaClient();
    await db.recipe_files.create({
      data: {
        recipeId,
        fileId,
      },
    });
  }

  async detachFileFromRecipe({ recipeId, fileId }: { recipeId: string; fileId: string }): Promise<void> {
    const db = getPrismaClient();
    await db.recipe_files.deleteMany({
      where: {
        recipeId,
        fileId,
      },
    });
  }

  async findFileIdsByRecipeId({ recipeId }: { recipeId: string }): Promise<string[]> {
    const db = getPrismaClient();
    const recipeFiles = await db.recipe_files.findMany({
      where: { recipeId },
      select: { fileId: true },
    });

    return recipeFiles.map((rf) => rf.fileId);
  }
}

export const recipeRepository = new PrismaRecipeRepository();
