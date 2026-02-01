import { prisma } from "~/server/database/prisma";
import type { Recipe, RecipeIngredient } from "generated/gql/graphql";

export interface RecipeIngredientData {
  name: string;
  quantity: number;
  unit: string;
}

export interface CreateRecipeData {
  name: string;
  servings: number;
  userId: string;
  ingredients: RecipeIngredientData[];
}

export interface UpdateRecipeData {
  name?: string;
  servings?: number;
  ingredients?: RecipeIngredientData[];
}

class PrismaRecipeRepository {
  async findManyByUserId(userId: string): Promise<Recipe[]> {
    const recipes = await prisma.recipes.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        recipeIngredients: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      ingredients: recipe.recipeIngredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity.toNumber(),
        unit: ingredient.unit,
      })),
    }));
  }

  async findById(recipeId: string, userId: string): Promise<Recipe | null> {
    const recipe = await prisma.recipes.findFirst({
      where: {
        id: recipeId,
        userId,
        deletedAt: null,
      },
      include: {
        recipeIngredients: true,
      },
    });

    if (!recipe) {
      return null;
    }

    return {
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      ingredients: recipe.recipeIngredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity.toNumber(),
        unit: ingredient.unit,
      })),
    };
  }

  async create(data: CreateRecipeData): Promise<Recipe> {
    const recipe = await prisma.recipes.create({
      data: {
        name: data.name,
        servings: data.servings,
        userId: data.userId,
        recipeIngredients: {
          create: data.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          })),
        },
      },
      include: {
        recipeIngredients: true,
      },
    });

    return {
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      ingredients: recipe.recipeIngredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity.toNumber(),
        unit: ingredient.unit,
      })),
    };
  }

  async update(
    recipeId: string,
    userId: string,
    data: UpdateRecipeData,
  ): Promise<Recipe> {
    const recipe = await prisma.recipes.update({
      where: { id: recipeId, userId },
      data: {
        name: data.name,
        servings: data.servings,
        updatedAt: new Date(),
        ...(data.ingredients && {
          recipeIngredients: {
            deleteMany: {},
            create: data.ingredients.map((ingredient) => ({
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            })),
          },
        }),
      },
      include: {
        recipeIngredients: true,
      },
    });

    return {
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      ingredients: recipe.recipeIngredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity.toNumber(),
        unit: ingredient.unit,
      })),
    };
  }

  async softDelete(recipeId: string, userId: string): Promise<Recipe> {
    const recipe = await prisma.recipes.update({
      where: { id: recipeId, userId },
      data: { deletedAt: new Date() },
      include: {
        recipeIngredients: true,
      },
    });

    return {
      id: recipe.id,
      name: recipe.name,
      servings: recipe.servings,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      ingredients: recipe.recipeIngredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity.toNumber(),
        unit: ingredient.unit,
      })),
    };
  }
}

export const recipeRepository = new PrismaRecipeRepository();
