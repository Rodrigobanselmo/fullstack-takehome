import type { RecipeGroup } from "generated/gql/graphql";
import { getPrismaClient } from "~/server/database/transaction";

// Scalar entity without nested relations (recipes will be loaded by field resolver)
export type RecipeGroupEntity = Omit<RecipeGroup, "recipes">;

export interface CreateRecipeGroupData {
  name: string;
  description?: string;
  userId: string;
  recipeIds?: string[];
}

export interface UpdateRecipeGroupData {
  groupId: string;
  userId: string;
  name?: string;
  description?: string;
}

class PrismaRecipeGroupRepository {
  async findManyByUserId({
    userId,
  }: {
    userId: string;
  }): Promise<RecipeGroupEntity[]> {
    const db = getPrismaClient();
    const groups = await db.recipe_groups.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description ?? undefined,
      userId: group.userId,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    }));
  }

  async findById({
    groupId,
    userId,
  }: {
    groupId: string;
    userId: string;
  }): Promise<RecipeGroupEntity | null> {
    const db = getPrismaClient();
    const group = await db.recipe_groups.findFirst({
      where: {
        id: groupId,
        userId,
        deletedAt: null,
      },
    });

    if (!group) {
      return null;
    }

    return {
      id: group.id,
      name: group.name,
      description: group.description ?? undefined,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  async create(data: CreateRecipeGroupData): Promise<RecipeGroupEntity> {
    const db = getPrismaClient();
    const group = await db.recipe_groups.create({
      data: {
        name: data.name,
        description: data.description,
        userId: data.userId,
        ...(data.recipeIds &&
          data.recipeIds.length > 0 && {
            recipes: {
              create: data.recipeIds.map((recipeId) => ({
                recipeId,
              })),
            },
          }),
      },
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description ?? undefined,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  async update(data: UpdateRecipeGroupData): Promise<RecipeGroupEntity> {
    const db = getPrismaClient();
    const group = await db.recipe_groups.update({
      where: { id: data.groupId, userId: data.userId },
      data: {
        name: data.name,
        description: data.description,
        updatedAt: new Date(),
      },
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description ?? undefined,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  async softDelete({
    groupId,
    userId,
  }: {
    groupId: string;
    userId: string;
  }): Promise<RecipeGroupEntity> {
    const db = getPrismaClient();
    const group = await db.recipe_groups.update({
      where: { id: groupId, userId },
      data: { deletedAt: new Date() },
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description ?? undefined,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  async addRecipes({
    groupId,
    userId,
    recipeIds,
  }: {
    groupId: string;
    userId: string;
    recipeIds: string[];
  }): Promise<RecipeGroupEntity> {
    const db = getPrismaClient();
    await db.recipe_group_recipes.createMany({
      data: recipeIds.map((recipeId) => ({
        groupId,
        recipeId,
      })),
      skipDuplicates: true,
    });

    // Return updated group
    return this.findById({ groupId, userId }).then((group) => group!);
  }

  async removeRecipes({
    groupId,
    userId,
    recipeIds,
  }: {
    groupId: string;
    userId: string;
    recipeIds: string[];
  }): Promise<RecipeGroupEntity> {
    const db = getPrismaClient();
    await db.recipe_group_recipes.deleteMany({
      where: {
        groupId,
        recipeId: { in: recipeIds },
      },
    });

    // Return updated group
    return this.findById({ groupId, userId }).then((group) => group!);
  }

  async setRecipes({
    groupId,
    userId,
    recipeIds,
  }: {
    groupId: string;
    userId: string;
    recipeIds: string[];
  }): Promise<RecipeGroupEntity> {
    const db = getPrismaClient();

    // Delete all existing recipes for this group
    await db.recipe_group_recipes.deleteMany({
      where: { groupId },
    });

    // Add new recipes
    if (recipeIds.length > 0) {
      await db.recipe_group_recipes.createMany({
        data: recipeIds.map((recipeId) => ({
          groupId,
          recipeId,
        })),
        skipDuplicates: true,
      });
    }

    // Return updated group
    return this.findById({ groupId, userId }).then((group) => group!);
  }

  // File relations
  async attachFileToRecipeGroup({
    groupId,
    fileId,
  }: {
    groupId: string;
    fileId: string;
  }): Promise<void> {
    const db = getPrismaClient();
    await db.recipe_group_files.create({
      data: {
        groupId,
        fileId,
      },
    });
  }

  async detachFileFromRecipeGroup({
    groupId,
    fileId,
  }: {
    groupId: string;
    fileId: string;
  }): Promise<void> {
    const db = getPrismaClient();
    await db.recipe_group_files.deleteMany({
      where: {
        groupId,
        fileId,
      },
    });
  }

  async findFileIdsByRecipeGroupId({
    groupId,
  }: {
    groupId: string;
  }): Promise<string[]> {
    const db = getPrismaClient();
    const groupFiles = await db.recipe_group_files.findMany({
      where: { groupId },
      select: { fileId: true },
    });

    return groupFiles.map((gf) => gf.fileId);
  }
}

export const recipeGroupRepository = new PrismaRecipeGroupRepository();
