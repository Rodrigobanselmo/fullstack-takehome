import type {
  AddRecipesToGroupInput,
  CreateRecipeGroupInput,
  RemoveRecipesFromGroupInput,
  UpdateRecipeGroupInput,
} from "generated/gql/graphql";
import { withTransaction } from "~/server/database/transaction";
import {
  recipeGroupRepository,
  type RecipeGroupEntity,
} from "~/server/repositories/recipe-group.repository";
import { recipeRepository } from "~/server/repositories/recipe.repository";
import {
  RecipeGroupNotFoundError,
  RecipeRequiresGroupError,
} from "./recipe-group.errors";

export async function getRecipeGroupsByUserId({
  userId,
}: {
  userId: string;
}): Promise<RecipeGroupEntity[]> {
  return recipeGroupRepository.findManyByUserId({ userId });
}

export async function getRecipeGroupById({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}): Promise<RecipeGroupEntity> {
  const group = await recipeGroupRepository.findById({ groupId, userId });

  if (!group) {
    throw RecipeGroupNotFoundError();
  }

  return group;
}

export async function createRecipeGroup({
  userId,
  input,
}: {
  userId: string;
  input: CreateRecipeGroupInput;
}): Promise<RecipeGroupEntity> {
  return recipeGroupRepository.create({
    name: input.name,
    description: input.description ?? undefined,
    userId,
    recipeIds: input.recipeIds ?? undefined,
  });
}

export async function updateRecipeGroup({
  userId,
  groupId,
  input,
}: {
  userId: string;
  groupId: string;
  input: UpdateRecipeGroupInput;
}): Promise<RecipeGroupEntity> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId, userId });

  return withTransaction(async () => {
    // Update basic fields
    const updatedGroup = await recipeGroupRepository.update({
      groupId,
      userId,
      name: input.name ?? undefined,
      description: input.description ?? undefined,
    });

    // Update recipes if provided
    if (input.recipeIds !== undefined && input.recipeIds !== null) {
      return recipeGroupRepository.setRecipes({
        groupId,
        userId,
        recipeIds: input.recipeIds,
      });
    }

    return updatedGroup;
  });
}

export async function deleteRecipeGroup({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}): Promise<string> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId, userId });

  await recipeGroupRepository.softDelete({ groupId, userId });
  return groupId;
}

export async function addRecipesToGroup({
  userId,
  input,
}: {
  userId: string;
  input: AddRecipesToGroupInput;
}): Promise<RecipeGroupEntity> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId: input.groupId, userId });

  return recipeGroupRepository.addRecipes({
    groupId: input.groupId,
    userId,
    recipeIds: input.recipeIds,
  });
}

export async function removeRecipesFromGroup({
  userId,
  input,
}: {
  userId: string;
  input: RemoveRecipesFromGroupInput;
}): Promise<RecipeGroupEntity> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId: input.groupId, userId });

  // Check if any recipe would be left without a group
  const groupCounts = await recipeGroupRepository.countGroupsForRecipes({
    recipeIds: input.recipeIds,
    userId,
  });

  const recipesWithOnlyOneGroup: string[] = [];
  for (const recipeId of input.recipeIds) {
    const count = groupCounts.get(recipeId) ?? 0;
    if (count <= 1) {
      recipesWithOnlyOneGroup.push(recipeId);
    }
  }

  if (recipesWithOnlyOneGroup.length > 0) {
    // Get recipe names for better error message
    const recipes = await recipeRepository.findManyByUserId({ userId });
    const recipeNames = recipesWithOnlyOneGroup
      .map((id) => recipes.find((r) => r.id === id)?.name ?? id)
      .filter(Boolean);
    throw RecipeRequiresGroupError(recipeNames);
  }

  return recipeGroupRepository.removeRecipes({
    groupId: input.groupId,
    userId,
    recipeIds: input.recipeIds,
  });
}
