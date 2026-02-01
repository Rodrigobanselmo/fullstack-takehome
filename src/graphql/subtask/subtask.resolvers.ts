import {
  type MutationCreateSubtaskArgs,
  type MutationDeleteSubtaskArgs,
  type MutationUpdateSubtaskArgs,
  type QuerySubtaskArgs,
  type QuerySubtasksArgs,
} from "generated/gql/graphql";
import { canManageSubtasks, canViewSubtasks } from "./subtask.auth";
import { schemaValidation } from "~/lib/validation";
import type { GraphQLContext } from "../context";
import { InvalidInputError, UnauthorizedError } from "../errors";
import {
  createSubtask,
  deleteSubtask,
  getSubtaskById,
  getSubtasksByJobId,
  updateSubtask,
} from "./subtask.services";
import {
  createSubtaskInputSchema,
  querySubtasksArgsSchema,
  subtaskArgsSchema,
  updateSubtaskArgsSchema,
} from "./subtask.validators";

export const subtaskResolvers = {
  Query: {
    subtasks: async (
      _: unknown,
      args: QuerySubtasksArgs,
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canViewSubtasks(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(querySubtasksArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      const { jobId } = validation.data;

      return getSubtasksByJobId({
        jobId,
        userId: context.user!.id,
      });
    },

    subtask: async (
      _: unknown,
      args: QuerySubtaskArgs,
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canViewSubtasks(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(subtaskArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return getSubtaskById({
        subtaskId: validation.data.id,
        jobId: validation.data.jobId,
        userId: context.user!.id,
      });
    },
  },

  Mutation: {
    createSubtask: async (
      _: unknown,
      args: MutationCreateSubtaskArgs,
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canManageSubtasks(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(createSubtaskInputSchema, args.input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return createSubtask({
        userId: context.user!.id,
        input: validation.data,
      });
    },

    updateSubtask: async (
      _: unknown,
      args: MutationUpdateSubtaskArgs,
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canManageSubtasks(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const inputValidation = schemaValidation(updateSubtaskArgsSchema, args);
      if (inputValidation.success === false) {
        throw InvalidInputError(inputValidation.error);
      }

      const { id, jobId, input } = inputValidation.data;

      return updateSubtask({
        userId: context.user!.id,
        subtaskId: id,
        jobId,
        input,
      });
    },

    deleteSubtask: async (
      _: unknown,
      args: MutationDeleteSubtaskArgs,
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canManageSubtasks(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(subtaskArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }
      const { id, jobId } = validation.data;

      return deleteSubtask({
        userId: context.user!.id,
        subtaskId: id,
        jobId,
      });
    },
  },
};
