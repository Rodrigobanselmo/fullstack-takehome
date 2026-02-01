import { AsyncLocalStorage } from "async_hooks";
import { prisma } from "~/server/database/prisma";
import type { Prisma } from "generated/prisma";

/**
 * Transaction context that can be passed to repositories
 * If provided, repositories should use this transaction client instead of the global prisma client
 */
export type TransactionClient = Prisma.TransactionClient;

/**
 * AsyncLocalStorage to store the current transaction context
 */
const transactionContext = new AsyncLocalStorage<TransactionClient>();

/**
 * Get the current Prisma client (transaction or global)
 * If running within a transaction, returns the transaction client
 * Otherwise, returns the global prisma client
 *
 * @example
 * ```typescript
 * const db = getPrismaClient();
 * const user = await db.users.findFirst({ where: { id: userId } });
 * ```
 */
export function getPrismaClient(): TransactionClient | typeof prisma {
  return transactionContext.getStore() ?? prisma;
}

/**
 * Execute multiple operations in a database transaction
 * All repository operations within the callback will automatically use the transaction
 *
 * @example
 * ```typescript
 * const result = await withTransaction(async () => {
 *   const recipe = await recipeRepository.create(data);
 *   await recipeRepository.attachFileToRecipe(recipe.id, fileId);
 *   return recipe;
 * });
 * ```
 */
export async function withTransaction<T>(
  callback: () => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return transactionContext.run(tx, callback);
  });
}

