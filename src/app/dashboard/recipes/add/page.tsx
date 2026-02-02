"use client";

import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import RecipeForm from "~/features/recipes/components/recipe-form/recipe-form";
import { useCreateRecipeMutation } from "~/features/recipes/api/use-create-recipe-mutation";
import type { CreateRecipeFormData } from "~/features/recipes/schemas/create-recipe-schema";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function AddRecipePage() {
  const router = useRouter();
  const [createRecipe, { loading, error }] = useCreateRecipeMutation();

  const handleSubmit = async (data: CreateRecipeFormData) => {
    const result = await createRecipe({
      variables: {
        input: {
          name: data.name,
          servings: parseInt(data.servings),
          tags: data.tags,
          overallRating: data.overallRating
            ? parseInt(data.overallRating)
            : undefined,
          prepTimeMinutes: data.prepTimeMinutes
            ? parseInt(data.prepTimeMinutes)
            : undefined,
          ingredients: data.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: parseFloat(ing.quantity),
            unit: ing.unit,
            notes: ing.notes,
            optional: ing.optional,
          })),
        },
      },
    });

    if (result.data?.createRecipe) {
      router.push(
        paths.dashboard.recipes.view.getHref(result.data.createRecipe.id),
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Add New Recipe" onBack={handleCancel} />
      <div className={styles.formContainer}>
        <RecipeForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error?.message}
          onCancel={handleCancel}
          submitButtonText="Create Recipe"
          loadingText="Creating Recipe..."
        />
      </div>
    </div>
  );
}
