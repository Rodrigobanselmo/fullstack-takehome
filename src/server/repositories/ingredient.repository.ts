import type { Ingredient, IngredientCategory } from "generated/gql/graphql";
import { getPrismaClient } from "~/server/database/transaction";
import { Prisma } from "generated/prisma";
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
  categories?: string[];
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
  categories?: string[];
  defaultUnit?: string;
  averagePrice?: Prisma.Decimal;
  priceUnit?: string;
  priceCurrency?: string;
}

class PrismaIngredientRepository {
  /**
   * Find ingredients for a user with system ingredients included.
   * Uses DISTINCT ON (name) to deduplicate by name, prioritizing user's own ingredients.
   * User's ingredients (non-null userId) take precedence over system ingredients (null userId).
   */
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

    // Use raw query with DISTINCT ON to get unique ingredients by name,
    // prioritizing user's ingredients over system ingredients.
    // NULLS LAST ensures user's ingredient (non-null userId) comes first.

    // Build the cursor condition
    const cursorCondition = cursor
      ? Prisma.sql`AND name > (SELECT name FROM ingredients WHERE id = ${cursor})`
      : Prisma.empty;

    const ingredients = await db.$queryRaw<
      Array<{
        id: string;
        name: string;
        description: string | null;
        categories: string[];
        default_unit: string | null;
        average_price: number | null;
        price_unit: string | null;
        price_currency: string | null;
        user_id: string | null;
        created_at: Date;
        updated_at: Date;
      }>
    >(
      Prisma.sql`
        SELECT DISTINCT ON (name)
          id, name, description, categories, default_unit,
          average_price, price_unit, price_currency,
          user_id, created_at, updated_at
        FROM ingredients
        WHERE (user_id IS NULL OR user_id = ${userId})
          AND deleted_at IS NULL
          ${cursorCondition}
        ORDER BY name, user_id NULLS LAST
        LIMIT ${limit}
      `,
    );

    return ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      categories: (ingredient.categories ?? []) as IngredientCategory[],
      defaultUnit: ingredient.default_unit ?? undefined,
      averagePrice: ingredient.average_price ?? undefined,
      priceUnit: ingredient.price_unit ?? undefined,
      priceCurrency: ingredient.price_currency ?? undefined,
      userId: ingredient.user_id ?? undefined,
      isSystem: ingredient.user_id === null,
      createdAt: ingredient.created_at,
      updatedAt: ingredient.updated_at,
    }));
  }

  /**
   * Find an ingredient by ID.
   * Allows access to system ingredients (userId = null) or user's own ingredients.
   */
  async findById({
    ingredientId,
    userId,
  }: {
    ingredientId: string;
    userId: string;
  }): Promise<IngredientEntity | null> {
    const db = getPrismaClient();
    // Allow access to system ingredients (userId = null) or user's own ingredients
    const ingredient = await db.ingredients.findFirst({
      where: {
        id: ingredientId,
        OR: [{ userId: null }, { userId }],
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
      categories: (ingredient.categories ?? []) as IngredientCategory[],
      defaultUnit: ingredient.defaultUnit ?? undefined,
      averagePrice: ingredient.averagePrice?.toNumber() ?? undefined,
      priceUnit: ingredient.priceUnit ?? undefined,
      priceCurrency: ingredient.priceCurrency ?? undefined,
      userId: ingredient.userId ?? undefined,
      isSystem: ingredient.userId === null,
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

    // Convert categories array to PostgreSQL array format
    const categoriesArray = data.categories ?? [];

    // Use raw query to insert with embedding (Prisma doesn't support vector type)
    const created = await db.$queryRaw<
      Array<{
        id: string;
        name: string;
        description: string | null;
        categories: string[];
        default_unit: string | null;
        average_price: number | null;
        price_unit: string | null;
        price_currency: string | null;
        user_id: string | null;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      INSERT INTO ingredients (
        id, name, description, categories, default_unit,
        average_price, price_unit, price_currency,
        user_id, created_at, updated_at, embedding
      )
      VALUES (
        gen_random_uuid()::text,
        ${data.name},
        ${data.description ?? null},
        ${categoriesArray},
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
        id, name, description, categories, default_unit,
        average_price, price_unit, price_currency,
        user_id, created_at, updated_at
    `;

    const ingredient = created[0]!;

    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      categories: (ingredient.categories ?? []) as IngredientCategory[],
      defaultUnit: ingredient.default_unit ?? undefined,
      averagePrice: ingredient.average_price ?? undefined,
      priceUnit: ingredient.price_unit ?? undefined,
      priceCurrency: ingredient.price_currency ?? undefined,
      userId: ingredient.user_id ?? undefined,
      isSystem: ingredient.user_id === null,
      createdAt: ingredient.created_at,
      updatedAt: ingredient.updated_at,
    };
  }

  /**
   * Update an ingredient.
   * Only allows updating user's own ingredients (not system ingredients).
   */
  async update(data: UpdateIngredientData): Promise<IngredientEntity | null> {
    const db = getPrismaClient();

    // Check if ingredient exists and is accessible by user
    const existing = await this.findById({
      ingredientId: data.ingredientId,
      userId: data.userId,
    });
    if (!existing) {
      return null;
    }

    // Don't allow updating system ingredients directly
    if (existing.isSystem) {
      return null;
    }

    // If name is being updated, regenerate embedding
    let embeddingStr: string | null = null;
    if (data.name) {
      const normalizedName = data.name.trim().toLowerCase();
      const embedding = await generateEmbedding(normalizedName);
      embeddingStr = formatEmbeddingForPostgres(embedding);
    }

    // Handle categories update - use existing if not provided
    const categoriesArray = data.categories ?? undefined;

    // Use raw query to update with embedding if name changed
    const updated = await db.$queryRaw<
      Array<{
        id: string;
        name: string;
        description: string | null;
        categories: string[];
        default_unit: string | null;
        average_price: number | null;
        price_unit: string | null;
        price_currency: string | null;
        user_id: string | null;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      UPDATE ingredients
      SET
        name = COALESCE(${data.name ?? null}, name),
        description = COALESCE(${data.description ?? null}, description),
        categories = COALESCE(${categoriesArray ?? null}, categories),
        default_unit = COALESCE(${data.defaultUnit ?? null}, default_unit),
        average_price = COALESCE(${data.averagePrice ?? null}, average_price),
        price_unit = COALESCE(${data.priceUnit ?? null}, price_unit),
        price_currency = COALESCE(${data.priceCurrency ?? null}, price_currency),
        embedding = COALESCE(${embeddingStr}::vector, embedding),
        updated_at = NOW()
      WHERE id = ${data.ingredientId}
        AND user_id = ${data.userId}
      RETURNING
        id, name, description, categories, default_unit,
        average_price, price_unit, price_currency,
        user_id, created_at, updated_at
    `;

    const ingredient = updated[0];
    if (!ingredient) {
      return null;
    }

    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      categories: (ingredient.categories ?? []) as IngredientCategory[],
      defaultUnit: ingredient.default_unit ?? undefined,
      averagePrice: ingredient.average_price ?? undefined,
      priceUnit: ingredient.price_unit ?? undefined,
      priceCurrency: ingredient.price_currency ?? undefined,
      userId: ingredient.user_id ?? undefined,
      isSystem: ingredient.user_id === null,
      createdAt: ingredient.created_at,
      updatedAt: ingredient.updated_at,
    };
  }

  /**
   * Delete an ingredient (soft delete).
   * Only allows deleting user's own ingredients (not system ingredients).
   */
  async delete({
    ingredientId,
    userId,
  }: {
    ingredientId: string;
    userId: string;
  }): Promise<IngredientEntity | null> {
    const db = getPrismaClient();

    // Check if ingredient exists and is accessible by user
    const existing = await this.findById({ ingredientId, userId });
    if (!existing) {
      return null;
    }

    // Don't allow deleting system ingredients
    if (existing.isSystem) {
      return null;
    }

    // Soft delete - only user's own ingredients
    const result = await db.$queryRaw<
      Array<{
        id: string;
        name: string;
        description: string | null;
        categories: string[];
        default_unit: string | null;
        average_price: number | null;
        price_unit: string | null;
        price_currency: string | null;
        user_id: string | null;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      UPDATE ingredients
      SET deleted_at = NOW()
      WHERE id = ${ingredientId}
        AND user_id = ${userId}
      RETURNING
        id, name, description, categories, default_unit,
        average_price, price_unit, price_currency,
        user_id, created_at, updated_at
    `;

    const ingredient = result[0];
    if (!ingredient) {
      return null;
    }

    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description ?? undefined,
      categories: (ingredient.categories ?? []) as IngredientCategory[],
      defaultUnit: ingredient.default_unit ?? undefined,
      averagePrice: ingredient.average_price ?? undefined,
      priceUnit: ingredient.price_unit ?? undefined,
      priceCurrency: ingredient.price_currency ?? undefined,
      userId: ingredient.user_id ?? undefined,
      isSystem: ingredient.user_id === null,
      createdAt: ingredient.created_at,
      updatedAt: ingredient.updated_at,
    };
  }

  /**
   * Find similar ingredients by name using vector search.
   * Searches both system ingredients and user's own ingredients.
   */
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

    // Search both system ingredients and user's own ingredients
    // Use DISTINCT ON to prioritize user's ingredients over system ones
    const results = await db.$queryRaw<
      Array<{
        id: string;
        name: string;
        distance: number;
      }>
    >`
      SELECT DISTINCT ON (name)
        id,
        name,
        (embedding <=> ${embeddingStr}::vector) as distance
      FROM ingredients
      WHERE (user_id IS NULL OR user_id = ${userId})
        AND deleted_at IS NULL
        AND embedding IS NOT NULL
      ORDER BY name, user_id NULLS LAST, embedding <=> ${embeddingStr}::vector
      LIMIT ${limit * 2}
    `;

    // Re-sort by distance since DISTINCT ON changes the ordering
    return results
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        name: r.name,
        distance: r.distance,
      }));
  }
}

export const ingredientRepository = new PrismaIngredientRepository();
