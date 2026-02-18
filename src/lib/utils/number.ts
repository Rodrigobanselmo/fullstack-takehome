/**
 * Converts a string to a number if it's a valid number, otherwise returns null.
 * @param value - The string value to convert
 * @returns The parsed number or null if the value is not a valid number
 */
export function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = typeof value === "number" ? value : Number(value);

  return Number.isNaN(num) ? null : num;
}