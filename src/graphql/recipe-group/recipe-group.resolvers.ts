import type {
  MutationCreateRecipeGroupArgs,
  MutationDeleteRecipeGroupArgs,
  MutationUpdateRecipeGroupArgs,
  MutationAddRecipesToGroupArgs,
  MutationRemoveRecipesFromGroupArgs,
  MutationUploadRecipeGroupImageArgs,
  MutationDeleteRecipeGroupImageArgs,
  QueryRecipeGroupArgs,
  Recipe,
} from "generated/gql/graphql";
import { canManageRecipeGroups, canViewRecipeGroups } from "./recipe-group.auth";
import { schemaValidation } from "~/lib/validation";
import type { GraphQLContext } from "../context";
import { InvalidInputError, UnauthorizedError } from "../errors";
import {
  createRecipeGroup,
  deleteRecipeGroup,
  getRecipeGroupById,
  getRecipeGroupsByUserId,
  updateRecipeGroup,
  addRecipesToGroup,
  removeRecipesFromGroup,
  uploadRecipeGroupImagePresigned,
  deleteRecipeGroupImage as deleteRecipeGroupImageService,
} from "./recipe-group.services";
import type { RecipeGroupEntity } from "~/server/repositories/recipe-group.repository";
import {
  createRecipeGroupInputSchema,
  recipeGroupArgsSchema,
  updateRecipeGroupArgsSchema,
  addRecipesToGroupInputSchema,
  removeRecipesFromGroupInputSchema,
  generateRecipeGroupPresignedUrlInputSchema,
  deleteRecipeGroupImageArgsSchema,
} from "./recipe-group.validators";
import type { FileEntity } from "~/server/repositories/file.repository";

export const recipeGroupResolvers = {
  RecipeGroup: {
    recipes: async (
      parent: RecipeGroupEntity,
      _: unknown,
      context: GraphQLContext,
    ): Promise<Recipe[]> => {
      return context.dataloaders.recipesByGroupId.load(parent.id);
    },
    image: async (
      parent: RecipeGroupEntity,
      _: unknown,
      context: GraphQLContext,
    ): Promise<FileEntity | null> => {
      return context.dataloaders.fileByRecipeGroupId.load(parent.id);
    },
  },

  Query: {
    recipeGroups: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ): Promise<RecipeGroupEntity[]> => {
      const isUnauthorized = !canViewRecipeGroups(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return getRecipeGroupsByUserId({ userId: context.user!.id });
    },

    recipeGroup: async (
      _: unknown,
      args: QueryRecipeGroupArgs,
      context: GraphQLContext,
    ): Promise<RecipeGroupEntity | null> => {
      const isUnauthorized = !canViewRecipeGroups(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(recipeGroupArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return getRecipeGroupById({
        groupId: validation.data.id,
        userId: context.user!.id,
      });
    },
  },

  Mutation: {
    createRecipeGroup: async (
      _: unknown,
      args: MutationCreateRecipeGroupArgs,
      context: GraphQLContext,
    ): Promise<RecipeGroupEntity> => {
      const isUnauthorized = !canManageRecipeGroups(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(createRecipeGroupInputSchema, args.input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return createRecipeGroup({
        userId: context.user!.id,
        input: validation.data,
      });
    },

    updateRecipeGroup: async (
      _: unknown,
      args: MutationUpdateRecipeGroupArgs,
      context: GraphQLContext,
    ): Promise<RecipeGroupEntity> => {
      const isUnauthorized = !canManageRecipeGroups(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(updateRecipeGroupArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return updateRecipeGroup({
        userId: context.user!.id,
        groupId: validation.data.id,
        input: validation.data.input,
      });
    },

    deleteRecipeGroup: async (
      _: unknown,
      args: MutationDeleteRecipeGroupArgs,
      context: GraphQLContext,
    ): Promise<string> => {
      const isUnauthorized = !canManageRecipeGroups(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(recipeGroupArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return deleteRecipeGroup({
        userId: context.user!.id,
        groupId: validation.data.id,
      });
    },

    addRecipesToGroup: async (
      _: unknown,
      args: MutationAddRecipesToGroupArgs,
      context: GraphQLContext,
    ): Promise<RecipeGroupEntity> => {
      const isUnauthorized = !canManageRecipeGroups(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(addRecipesToGroupInputSchema, args.input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return addRecipesToGroup({
        userId: context.user!.id,
        input: validation.data,
      });
    },

    removeRecipesFromGroup: async (
      _: unknown,
      args: MutationRemoveRecipesFromGroupArgs,
      context: GraphQLContext,
    ): Promise<RecipeGroupEntity> => {
      const isUnauthorized = !canManageRecipeGroups(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(removeRecipesFromGroupInputSchema, args.input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return removeRecipesFromGroup({
        userId: context.user!.id,
        input: validation.data,
      });
    },

    uploadRecipeGroupImage: async (
      _: unknown,
      args: MutationUploadRecipeGroupImageArgs,
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canManageRecipeGroups(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(generateRecipeGroupPresignedUrlInputSchema, args.input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      const result = await uploadRecipeGroupImagePresigned({
        groupId: validation.data.groupId,
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

    deleteRecipeGroupImage: async (
      _: unknown,
      args: MutationDeleteRecipeGroupImageArgs,
      context: GraphQLContext,
    ): Promise<boolean> => {
      const isUnauthorized = !canManageRecipeGroups(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      if (!context.user) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(deleteRecipeGroupImageArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      await deleteRecipeGroupImageService({
        groupId: validation.data.groupId,
        userId: context.user.id,
      });

      return true;
    },
  },
};

