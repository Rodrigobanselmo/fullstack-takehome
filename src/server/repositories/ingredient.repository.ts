import type { Ingredient, IngredientCategory } from "generated/gql/graphql";
import { getPrismaClient } from "~/server/database/transaction";
import { type Prisma } from "generated/prisma";

// Scalar entity without nested relations
export type IngredientEntity = Omit<Ingredient, "image">;

export interface CreateIngredientData {
  name: string;
  description?: string;
  category?: string;
  defaultUnit?: string;
  averagePrice?: Prisma.Decimal;
  priceUnit?: string;
  priceCurrency?: string;
  userId: string;
}

export interface UpdateIngredientData {
  ingredientId: string;
  userId: string;
  name?: string;
  description?: string;
  category?: string;
  defaultUnit?: string;
  averagePrice?: Prisma.Decimal;
  priceUnit?: string;
  priceCurrency?: string;
}

class PrismaIngredientRepository {
  async findManyByUserId({ userId }: { userId: string }): Promise<IngredientEntity[]> {
    const db = getPrismaClient();
    const ingredients = await db.ingredients.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { name: "asc" },
    });

    return ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      category: ingredient.category as IngredientCategory,
      defaultUnit: ingredient.defaultUnit ?? undefined,
      averagePrice: ingredient.averagePrice ?? undefined,
      priceUnit: ingredient.priceUnit ?? undefined,
      priceCurrency: ingredient.priceCurrency ?? undefined,
      userId: ingredient.userId,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    }));
  }

  async findById({ ingredientId, userId }: { ingredientId: string; userId: string }): Promise<IngredientEntity | null> {
    const db = getPrismaClient();
    const ingredient = await db.ingredients.findFirst({
      where: {
        id: ingredientId,
        userId,
        deletedAt: null,
      },
    });

    if (!ingredient) {
      return null;
    }

    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      category: ingredient.category as IngredientCategory,
      defaultUnit: ingredient.defaultUnit ?? undefined,
      averagePrice: ingredient.averagePrice ?? undefined,
      priceUnit: ingredient.priceUnit ?? undefined,
      priceCurrency: ingredient.priceCurrency ?? undefined,
      userId: ingredient.userId,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }

  async create(data: CreateIngredientData): Promise<IngredientEntity> {
    const db = getPrismaClient();
    const ingredient = await db.ingredients.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        defaultUnit: data.defaultUnit,
        averagePrice: data.averagePrice,
        priceUnit: data.priceUnit,
        priceCurrency: data.priceCurrency,
        userId: data.userId,
      },
    });

    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      category: ingredient.category as IngredientCategory,
      defaultUnit: ingredient.defaultUnit ?? undefined,
      averagePrice: ingredient.averagePrice ?? undefined,
      priceUnit: ingredient.priceUnit ?? undefined,
      priceCurrency: ingredient.priceCurrency ?? undefined,
      userId: ingredient.userId,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }

  async update(data: UpdateIngredientData): Promise<IngredientEntity | null> {
    const db = getPrismaClient();
    
    // Check if ingredient exists and belongs to user
    const existing = await this.findById({ ingredientId: data.ingredientId, userId: data.userId });
    if (!existing) {
      return null;
    }

    const ingredient = await db.ingredients.update({
      where: { id: data.ingredientId },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        defaultUnit: data.defaultUnit,
        averagePrice: data.averagePrice,
        priceUnit: data.priceUnit,
        priceCurrency: data.priceCurrency,
        updatedAt: new Date(),
      },
    });

    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      category: ingredient.category as IngredientCategory,
      defaultUnit: ingredient.defaultUnit ?? undefined,
      averagePrice: ingredient.averagePrice ?? undefined,
      priceUnit: ingredient.priceUnit ?? undefined,
      priceCurrency: ingredient.priceCurrency ?? undefined,
      userId: ingredient.userId,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }

  async delete({ ingredientId, userId }: { ingredientId: string; userId: string }): Promise<IngredientEntity | null> {
    const db = getPrismaClient();

    // Check if ingredient exists and belongs to user
    const existing = await this.findById({ ingredientId, userId });
    if (!existing) {
      return null;
    }

    // Soft delete
    const ingredient = await db.ingredients.update({
      where: { id: ingredientId },
      data: { deletedAt: new Date() },
    });

    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      defaultUnit: ingredient.defaultUnit ?? undefined,
      averagePrice: ingredient.averagePrice ?? undefined,
      priceUnit: ingredient.priceUnit ?? undefined,
      priceCurrency: ingredient.priceCurrency ?? undefined,
      userId: ingredient.userId,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }
}

export const ingredientRepository = new PrismaIngredientRepository();

