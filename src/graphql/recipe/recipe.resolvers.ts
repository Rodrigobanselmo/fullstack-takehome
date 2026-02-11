import type {
  MutationCreateRecipeArgs,
  MutationDeleteRecipeArgs,
  MutationUpdateRecipeArgs,
  QueryRecipeArgs,
  Ingredient,
} from "generated/gql/graphql";
import { canManageRecipes, canViewRecipes } from "./recipe.auth";
import { schemaValidation } from "~/lib/validation";
import type { GraphQLContext } from "../context";
import { InvalidInputError, UnauthorizedError } from "../errors";
import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  getRecipesByUserId,
  updateRecipe,
} from "./recipe.services";
import type {
  RecipeEntity,
  RecipeIngredientEntity,
} from "~/server/repositories/recipe.repository";
import {
  createRecipeInputSchema,
  recipeArgsSchema,
  updateRecipeArgsSchema,
} from "./recipe.validators";
import type { FileEntity } from "~/server/repositories/file.repository";

export const recipeResolvers = {
  Recipe: {
    ingredients: async (
      parent: RecipeEntity,
      _: unknown,
      context: GraphQLContext,
    ): Promise<RecipeIngredientEntity[]> => {
      return context.dataloaders.ingredientsByRecipeId.load(parent.id);
    },
    image: async (
      parent: RecipeEntity,
      _: unknown,
      context: GraphQLContext,
    ): Promise<FileEntity | null> => {
      return context.dataloaders.fileByRecipeId.load(parent.id);
    },
  },

  RecipeIngredient: {
    ingredient: async (
      parent: RecipeIngredientEntity,
      _: unknown,
      context: GraphQLContext,
    ): Promise<Ingredient> => {
      const ingredient = await context.dataloaders.ingredientById.load(
        parent.ingredientId,
      );
      if (!ingredient) {
        throw new Error(`Ingredient not found: ${parent.ingredientId}`);
      }
      return ingredient;
    },
  },

  Query: {
    recipes: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ): Promise<RecipeEntity[]> => {
      const isUnauthorized = !canViewRecipes(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      return getRecipesByUserId({ userId: context.user.id });
    },

    recipe: async (
      _: unknown,
      args: QueryRecipeArgs,
      context: GraphQLContext,
    ): Promise<RecipeEntity | null> => {
      const isUnauthorized = !canViewRecipes(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(recipeArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return getRecipeById({
        recipeId: validation.data.id,
        userId: context.user.id,
      });
    },
  },

  Mutation: {
    createRecipe: async (
      _: unknown,
      args: MutationCreateRecipeArgs,
      context: GraphQLContext,
    ): Promise<RecipeEntity> => {
      const isUnauthorized = !canManageRecipes(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(createRecipeInputSchema, args.input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return createRecipe({
        userId: context.user.id,
        input: validation.data,
      });
    },

    updateRecipe: async (
      _: unknown,
      args: MutationUpdateRecipeArgs,
      context: GraphQLContext,
    ): Promise<RecipeEntity> => {
      const isUnauthorized = !canManageRecipes(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(updateRecipeArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return updateRecipe({
        userId: context.user.id,
        recipeId: validation.data.id,
        input: validation.data.input,
      });
    },

    deleteRecipe: async (
      _: unknown,
      args: MutationDeleteRecipeArgs,
      context: GraphQLContext,
    ): Promise<boolean> => {
      const isUnauthorized = !canManageRecipes(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(recipeArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return deleteRecipe({
        userId: context.user.id,
        recipeId: validation.data.id,
      });
    },
  },
};
