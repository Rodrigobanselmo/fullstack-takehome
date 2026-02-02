import DataLoader from "dataloader";
import { prisma } from "~/server/database/prisma";
import type { FileEntity } from "~/server/repositories/file.repository";

/**
 * DataLoader for batch loading files by recipe ID
 * Returns the first file (image) for each recipe
 */
export function createFileByRecipeIdLoader() {
  return new DataLoader<string, FileEntity | null>(async (recipeIds) => {
    // Fetch all recipe-file relationships for the requested recipe IDs
    const recipeFiles = await prisma.recipe_files.findMany({
      where: {
        recipeId: { in: [...recipeIds] },
      },
      include: {
        file: true,
      },
      orderBy: {
        createdAt: "asc", // Get the first uploaded file
      },
    });

    // Filter out deleted files and group by recipeId
    const filesByRecipeId = new Map<string, FileEntity>();

    for (const rf of recipeFiles) {
      const recipeId = rf.recipeId;

      // Skip deleted files
      if (rf.file.deletedAt) {
        continue;
      }

      // Only keep the first file for each recipe (if not already set)
      if (!filesByRecipeId.has(recipeId)) {
        filesByRecipeId.set(recipeId, {
          id: rf.file.id,
          key: rf.file.key,
          bucket: rf.file.bucket,
          region: rf.file.region,
          filename: rf.file.filename,
          mimeType: rf.file.mimeType,
          size: rf.file.size,
          uploaderId: rf.file.uploaderId,
          createdAt: rf.file.createdAt,
          updatedAt: rf.file.updatedAt,
        });
      }
    }

    // Return files in the same order as recipeIds
    // If a recipe has no file, return null
    return recipeIds.map((recipeId) => filesByRecipeId.get(recipeId) ?? null);
  });
}

/**
 * DataLoader for batch loading files by recipe group ID
 * Returns the first file (image) for each recipe group
 */
export function createFileByRecipeGroupIdLoader() {
  return new DataLoader<string, FileEntity | null>(async (groupIds) => {
    // Fetch all recipe-group-file relationships for the requested group IDs
    const groupFiles = await prisma.recipe_group_files.findMany({
      where: {
        groupId: { in: [...groupIds] },
      },
      include: {
        file: true,
      },
      orderBy: {
        createdAt: "asc", // Get the first uploaded file
      },
    });

    // Filter out deleted files and group by groupId
    const filesByGroupId = new Map<string, FileEntity>();

    for (const gf of groupFiles) {
      const groupId = gf.groupId;

      // Skip deleted files
      if (gf.file.deletedAt) {
        continue;
      }

      // Only keep the first file for each group (if not already set)
      if (!filesByGroupId.has(groupId)) {
        filesByGroupId.set(groupId, {
          id: gf.file.id,
          key: gf.file.key,
          bucket: gf.file.bucket,
          region: gf.file.region,
          filename: gf.file.filename,
          mimeType: gf.file.mimeType,
          size: gf.file.size,
          uploaderId: gf.file.uploaderId,
          createdAt: gf.file.createdAt,
          updatedAt: gf.file.updatedAt,
        });
      }
    }

    // Return files in the same order as groupIds
    // If a group has no file, return null
    return groupIds.map((groupId) => filesByGroupId.get(groupId) ?? null);
  });
}

/**
 * DataLoader for batch loading files by ingredient ID
 * Returns the first file (image) for each ingredient
 */
export function createFileByIngredientIdLoader() {
  return new DataLoader<string, FileEntity | null>(async (ingredientIds) => {
    // Fetch all ingredient-file relationships for the requested ingredient IDs
    const ingredientFiles = await prisma.ingredient_files.findMany({
      where: {
        ingredientId: { in: [...ingredientIds] },
      },
      include: {
        file: true,
      },
      orderBy: {
        createdAt: "asc", // Get the first uploaded file
      },
    });

    // Filter out deleted files and group by ingredientId
    const filesByIngredientId = new Map<string, FileEntity>();

    for (const inf of ingredientFiles) {
      const ingredientId = inf.ingredientId;

      // Skip deleted files
      if (inf.file.deletedAt) {
        continue;
      }

      // Only keep the first file for each ingredient (if not already set)
      if (!filesByIngredientId.has(ingredientId)) {
        filesByIngredientId.set(ingredientId, {
          id: inf.file.id,
          key: inf.file.key,
          bucket: inf.file.bucket,
          region: inf.file.region,
          filename: inf.file.filename,
          mimeType: inf.file.mimeType,
          size: inf.file.size,
          uploaderId: inf.file.uploaderId,
          createdAt: inf.file.createdAt,
          updatedAt: inf.file.updatedAt,
        });
      }
    }

    // Return files in the same order as ingredientIds
    // If an ingredient has no file, return null
    return ingredientIds.map(
      (ingredientId) => filesByIngredientId.get(ingredientId) ?? null,
    );
  });
}
