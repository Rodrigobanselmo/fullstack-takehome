"use client";

import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import RecipeForm from "~/features/recipes/components/recipe-form/recipe-form";
import { useQueryRecipe } from "~/features/recipes/api/use-query-recipe";
import { useUpdateRecipeMutation } from "~/features/recipes/api/use-update-recipe-mutation";
import type { CreateRecipeFormData } from "~/features/recipes/schemas/create-recipe-schema";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function EditRecipePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQueryRecipe(params.id);
  const [updateRecipe, { loading: updateLoading, error: updateError }] =
    useUpdateRecipeMutation();

  const recipe = data?.recipe;

  const handleSubmit = async (formData: CreateRecipeFormData) => {
    const result = await updateRecipe({
      variables: {
        id: params.id,
        input: {
          name: formData.name,
          servings: parseInt(formData.servings),
          tags: formData.tags,
          overallRating: formData.overallRating
            ? parseInt(formData.overallRating)
            : undefined,
          prepTimeMinutes: formData.prepTimeMinutes
            ? parseInt(formData.prepTimeMinutes)
            : undefined,
          ingredients: formData.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: parseFloat(ing.quantity),
            unit: ing.unit,
            notes: ing.notes,
            optional: ing.optional,
          })),
        },
      },
    });

    if (result.data?.updateRecipe) {
      router.push(paths.dashboard.recipes.view.getHref(params.id));
    }
  };

  const handleCancel = () => {
    router.push(paths.dashboard.recipes.view.getHref(params.id));
  };

  if (queryLoading) {
    return (
      <div className={styles.container}>
        <LoadingState message="Loading recipe..." />
      </div>
    );
  }

  if (queryError || !recipe) {
    return (
      <div className={styles.container}>
        <ErrorState
          title="Failed to load recipe"
          message={queryError?.message || "Recipe not found"}
        />
      </div>
    );
  }

  const initialData: CreateRecipeFormData = {
    name: recipe.name,
    servings: recipe.servings.toString(),
    tags: recipe.tags,
    overallRating: recipe.overallRating?.toString() || "",
    prepTimeMinutes: recipe.prepTimeMinutes?.toString() || "",
    ingredients: recipe.ingredients.map((ing) => ({
      ingredientId: ing.ingredientId,
      quantity: ing.quantity.toString(),
      unit: ing.unit,
      notes: ing.notes || "",
      optional: ing.optional || false,
    })),
  };

  return (
    <div className={styles.container}>
      <PageHeader title={`Edit: ${recipe.name}`} onBack={handleCancel} />
      <div className={styles.formContainer}>
        <RecipeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={updateLoading}
          error={updateError?.message}
          onCancel={handleCancel}
          submitButtonText="Update Recipe"
          loadingText="Updating Recipe..."
        />
      </div>
    </div>
  );
}
