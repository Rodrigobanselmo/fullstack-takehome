import type { ZodEffects, ZodSchema } from "zod";

type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export function schemaValidation<T>(
  schema: ZodSchema<T> | ZodEffects<ZodSchema<T>, T, unknown>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessage = result.error.errors
      .map((e) =>
        e.path.length ? `${e.path.join(".")}: ${e.message}` : e.message,
      )
      .join(", ");

    return {
      success: false,
      error: errorMessage,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
