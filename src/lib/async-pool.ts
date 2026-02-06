type AsyncPoolProps<T, S> = {
  items: T[];
  concurrency: number;
  callback: (item: T, index: number) => Promise<S>;
};

/**
 * Process items with a fixed number of concurrent workers.
 * Unlike batch processing, this keeps all workers busy - when one finishes,
 * it immediately picks up the next item.
 *
 * @example
 * const results = await asyncPool({
 *   items: [1, 2, 3, 4, 5],
 *   concurrency: 2,
 *   callback: async (item) => {
 *     await delay(100);
 *     return item * 2;
 *   },
 * });
 * // Results: [2, 4, 6, 8, 10] (in order)
 */
export async function asyncPool<T, S>({
  items,
  concurrency,
  callback,
}: AsyncPoolProps<T, S>): Promise<S[]> {
  const results: S[] = new Array(items.length) as S[];
  let currentIndex = 0;

  async function worker(): Promise<void> {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      const item = items[index]!;
      results[index] = await callback(item, index);
    }
  }

  // Start workers up to concurrency limit or items length (whichever is smaller)
  const workerCount = Math.min(concurrency, items.length);
  const workers: Promise<void>[] = [];

  for (let i = 0; i < workerCount; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  return results;
}
