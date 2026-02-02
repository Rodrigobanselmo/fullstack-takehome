import type {
  MutationCreateIngredientArgs,
  MutationDeleteIngredientArgs,
  MutationUpdateIngredientArgs,
  MutationUploadIngredientImageArgs,
  MutationDeleteIngredientImageArgs,
  QueryIngredientArgs,
} from "generated/gql/graphql";
import { canManageIngredients, canViewIngredients } from "./ingredient.auth";
import { schemaValidation } from "~/lib/validation";
import type { GraphQLContext } from "../context";
import { InvalidInputError, UnauthorizedError } from "../errors";
import {
  createIngredient,
  deleteIngredient,
  getIngredientById,
  getIngredientsByUserId,
  updateIngredient,
  uploadIngredientImagePresigned,
  deleteIngredientImage as deleteIngredientImageService,
} from "./ingredient.services";
import type { IngredientEntity } from "~/server/repositories/ingredient.repository";
import {
  createIngredientInputSchema,
  ingredientArgsSchema,
  updateIngredientArgsSchema,
  generateIngredientPresignedUrlInputSchema,
  deleteIngredientImageArgsSchema,
} from "./ingredient.validators";
import type { FileEntity } from "~/server/repositories/file.repository";

export const ingredientResolvers = {
  Ingredient: {
    image: async (
      parent: IngredientEntity,
      _: unknown,
      context: GraphQLContext,
    ): Promise<FileEntity | null> => {
      return context.dataloaders.fileByIngredientId.load(parent.id);
    },
  },

  Query: {
    ingredients: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ): Promise<IngredientEntity[]> => {
      const isUnauthorized = !canViewIngredients(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      return getIngredientsByUserId({ userId: context.user.id });
    },

    ingredient: async (
      _: unknown,
      args: QueryIngredientArgs,
      context: GraphQLContext,
    ): Promise<IngredientEntity | null> => {
      const isUnauthorized = !canViewIngredients(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(ingredientArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return getIngredientById({
        ingredientId: validation.data.id,
        userId: context.user.id,
      });
    },
  },

  Mutation: {
    createIngredient: async (
      _: unknown,
      args: MutationCreateIngredientArgs,
      context: GraphQLContext,
    ): Promise<IngredientEntity> => {
      const isUnauthorized = !canManageIngredients(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(
        createIngredientInputSchema,
        args.input,
      );
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return createIngredient({
        userId: context.user.id,
        input: args.input,
      });
    },

    updateIngredient: async (
      _: unknown,
      args: MutationUpdateIngredientArgs,
      context: GraphQLContext,
    ): Promise<IngredientEntity> => {
      const isUnauthorized = !canManageIngredients(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(updateIngredientArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return updateIngredient({
        userId: context.user.id,
        ingredientId: args.id,
        input: args.input,
      });
    },

    deleteIngredient: async (
      _: unknown,
      args: MutationDeleteIngredientArgs,
      context: GraphQLContext,
    ): Promise<boolean> => {
      const isUnauthorized = !canManageIngredients(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(ingredientArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return deleteIngredient({
        userId: context.user.id,
        ingredientId: validation.data.id,
      });
    },

    uploadIngredientImage: async (
      _: unknown,
      args: MutationUploadIngredientImageArgs,
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canManageIngredients(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(
        generateIngredientPresignedUrlInputSchema,
        args.input,
      );
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      const result = await uploadIngredientImagePresigned({
        ingredientId: validation.data.ingredientId,
        userId: context.user.id,
        filename: validation.data.filename,
        mimeType: validation.data.mimeType,
      });

      return {
        file: result.file,
        presignedPost: {
          url: result.presignedPost.url,
          fields: JSON.stringify(result.presignedPost.fields),
          key: result.presignedPost.key,
        },
      };
    },

    deleteIngredientImage: async (
      _: unknown,
      args: MutationDeleteIngredientImageArgs,
      context: GraphQLContext,
    ): Promise<boolean> => {
      const isUnauthorized = !canManageIngredients(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(
        deleteIngredientImageArgsSchema,
        args,
      );
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      await deleteIngredientImageService({
        ingredientId: validation.data.ingredientId,
        userId: context.user.id,
      });

      return true;
    },
  },
};
