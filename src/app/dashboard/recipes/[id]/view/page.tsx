"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import Button from "~/components/ui/button/button";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import RecipeForm from "~/features/recipes/components/recipe-form/recipe-form";
import { useQueryRecipe } from "~/features/recipes/api/use-query-recipe";
import { useUpdateRecipeMutation } from "~/features/recipes/api/use-update-recipe-mutation";
import { useDeleteRecipeMutation } from "~/features/recipes/api/use-delete-recipe-mutation";
import { useModal } from "~/components/ui/modal/modal-context";
import { ConfirmDialog } from "~/components/ui/modal/confirm-dialog";
import type { CreateRecipeFormData } from "~/features/recipes/schemas/create-recipe-schema";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function ViewRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { data, loading, error } = useQueryRecipe(id);
  const [updateRecipe, { loading: updateLoading, error: updateError }] =
    useUpdateRecipeMutation();
  const [deleteRecipe, { loading: deleteLoading }] = useDeleteRecipeMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const recipe = data?.recipe;

  const handleSubmit = async (formData: CreateRecipeFormData) => {
    await updateRecipe({
      variables: {
        id,
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
          instructions: formData.instructions || undefined,
          ingredients: formData.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: parseFloat(ing.quantity),
            unit: ing.unit,
            notes: ing.notes,
            optional: ing.optional,
            price: ing.price ? parseFloat(ing.price) : undefined,
          })),
        },
      },
    });
  };

  const handleDeleteClick = () => {
    const modalId = openModal(
      <ConfirmDialog
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipe?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await deleteRecipe({
              variables: { id },
            });
            closeModal(modalId);
            router.push(paths.dashboard.recipes.getHref());
          } finally {
            setIsDeleting(false);
          }
        }}
        onCancel={() => closeModal(modalId)}
      />,
    );
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingState message="Loading recipe..." />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className={styles.container}>
        <ErrorState message={error?.message || "Recipe not found"} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title={recipe.name} onBack={handleBack}>
        <div className={styles.actions}>
          <Button
            onClick={handleDeleteClick}
            variant="outline"
            color="danger"
            disabled={deleteLoading || isDeleting}
          >
            {deleteLoading || isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </PageHeader>
      <div className={styles.content}>
        <RecipeForm
          recipe={recipe}
          onSubmit={handleSubmit}
          onSuccess={() => router.back()}
          loading={updateLoading}
          error={updateError?.message}
          submitButtonText="Update Recipe"
          loadingText="Updating..."
          successMessage="Recipe updated successfully!"
          errorMessage="Failed to update recipe"
        />
      </div>
    </div>
  );
}
