import type { Ingredient, IngredientCategory } from "generated/gql/graphql";
import { getPrismaClient } from "~/server/database/transaction";
import { type Prisma } from "generated/prisma";
import {
  generateEmbedding,
  formatEmbeddingForPostgres,
} from "~/server/ai/embeddings";

// Scalar entity without nested relations
export type IngredientEntity = Omit<Ingredient, "image">;

// Vector search result
export interface SimilarIngredient {
  id: string;
  name: string;
  distance: number; // Lower = more similar (cosine distance)
}

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
  async findManyByUserId({
    userId,
    limit,
    cursor,
  }: {
    userId: string;
    limit: number;
    cursor?: string;
  }): Promise<IngredientEntity[]> {
    const db = getPrismaClient();
    const ingredients = await db.ingredients.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { name: "asc" },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
    });

    return ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      category: ingredient.category as IngredientCategory,
      defaultUnit: ingredient.defaultUnit ?? undefined,
      averagePrice: ingredient.averagePrice?.toNumber() ?? undefined,
      priceUnit: ingredient.priceUnit ?? undefined,
      priceCurrency: ingredient.priceCurrency ?? undefined,
      userId: ingredient.userId,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    }));
  }

  async findById({
    ingredientId,
    userId,
  }: {
    ingredientId: string;
    userId: string;
  }): Promise<IngredientEntity | null> {
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
      averagePrice: ingredient.averagePrice?.toNumber() ?? undefined,
      priceUnit: ingredient.priceUnit ?? undefined,
      priceCurrency: ingredient.priceCurrency ?? undefined,
      userId: ingredient.userId,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }

  async create(data: CreateIngredientData): Promise<IngredientEntity> {
    const db = getPrismaClient();

    // Generate embedding for the ingredient name
    const normalizedName = data.name.trim().toLowerCase();
    const embedding = await generateEmbedding(normalizedName);
    const embeddingStr = formatEmbeddingForPostgres(embedding);

    // Use raw query to insert with embedding (Prisma doesn't support vector type)
    const created = await db.$queryRaw<
      Array<{
        id: string;
        name: string;
        description: string | null;
        category: string | null;
        default_unit: string | null;
        average_price: number | null;
        price_unit: string | null;
        price_currency: string | null;
        user_id: string;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      INSERT INTO ingredients (
        id, name, description, category, default_unit,
        average_price, price_unit, price_currency,
        user_id, created_at, updated_at, embedding
      )
      VALUES (
        gen_random_uuid()::text,
        ${data.name},
        ${data.description ?? null},
        ${data.category ?? null},
        ${data.defaultUnit ?? null},
        ${data.averagePrice ?? null},
        ${data.priceUnit ?? null},
        ${data.priceCurrency ?? null},
        ${data.userId},
        NOW(),
        NOW(),
        ${embeddingStr}::vector
      )
      RETURNING
        id, name, description, category, default_unit,
        average_price, price_unit, price_currency,
        user_id, created_at, updated_at
    `;

    const ingredient = created[0]!;

    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      category: ingredient.category as IngredientCategory,
      defaultUnit: ingredient.default_unit ?? undefined,
      averagePrice: ingredient.average_price ?? undefined,
      priceUnit: ingredient.price_unit ?? undefined,
      priceCurrency: ingredient.price_currency ?? undefined,
      userId: ingredient.user_id,
      createdAt: ingredient.created_at,
      updatedAt: ingredient.updated_at,
    };
  }

  async update(data: UpdateIngredientData): Promise<IngredientEntity | null> {
    const db = getPrismaClient();

    // Check if ingredient exists and belongs to user
    const existing = await this.findById({
      ingredientId: data.ingredientId,
      userId: data.userId,
    });
    if (!existing) {
      return null;
    }

    // If name is being updated, regenerate embedding
    let embeddingStr: string | null = null;
    if (data.name) {
      const normalizedName = data.name.trim().toLowerCase();
      const embedding = await generateEmbedding(normalizedName);
      embeddingStr = formatEmbeddingForPostgres(embedding);
    }

    // Use raw query to update with embedding if name changed
    const updated = await db.$queryRaw<
      Array<{
        id: string;
        name: string;
        description: string | null;
        category: string | null;
        default_unit: string | null;
        average_price: number | null;
        price_unit: string | null;
        price_currency: string | null;
        user_id: string;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      UPDATE ingredients
      SET
        name = COALESCE(${data.name ?? null}, name),
        description = COALESCE(${data.description ?? null}, description),
        category = COALESCE(${data.category ?? null}, category),
        default_unit = COALESCE(${data.defaultUnit ?? null}, default_unit),
        average_price = COALESCE(${data.averagePrice ?? null}, average_price),
        price_unit = COALESCE(${data.priceUnit ?? null}, price_unit),
        price_currency = COALESCE(${data.priceCurrency ?? null}, price_currency),
        embedding = COALESCE(${embeddingStr}::vector, embedding),
        updated_at = NOW()
      WHERE id = ${data.ingredientId}
      RETURNING
        id, name, description, category, default_unit,
        average_price, price_unit, price_currency,
        user_id, created_at, updated_at
    `;

    const ingredient = updated[0]!;

    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      category: ingredient.category as IngredientCategory,
      defaultUnit: ingredient.default_unit ?? undefined,
      averagePrice: ingredient.average_price ?? undefined,
      priceUnit: ingredient.price_unit ?? undefined,
      priceCurrency: ingredient.price_currency ?? undefined,
      userId: ingredient.user_id,
      createdAt: ingredient.created_at,
      updatedAt: ingredient.updated_at,
    };
  }

  async delete({
    ingredientId,
    userId,
  }: {
    ingredientId: string;
    userId: string;
  }): Promise<IngredientEntity | null> {
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
      averagePrice: ingredient.averagePrice?.toNumber() ?? undefined,
      priceUnit: ingredient.priceUnit ?? undefined,
      priceCurrency: ingredient.priceCurrency ?? undefined,
      userId: ingredient.userId,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }

  async findSimilarByName({
    userId,
    name,
    limit = 5,
  }: {
    userId: string;
    name: string;
    limit?: number;
  }): Promise<SimilarIngredient[]> {
    const db = getPrismaClient();

    // Generate embedding for the search term
    const normalizedName = name.trim().toLowerCase();
    const embedding = await generateEmbedding(normalizedName);
    const embeddingStr = formatEmbeddingForPostgres(embedding);

    const results = await db.$queryRaw<
      Array<{
        id: string;
        name: string;
        distance: number;
      }>
    >`
      SELECT
        id,
        name,
        (embedding <=> ${embeddingStr}::vector) as distance
      FROM ingredients
      WHERE user_id = ${userId}
        AND deleted_at IS NULL
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `;

    return results.map((r) => ({
      id: r.id,
      name: r.name,
      distance: r.distance,
    }));
  }
}

export const ingredientRepository = new PrismaIngredientRepository();
