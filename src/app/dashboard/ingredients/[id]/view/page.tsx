"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import Button from "~/components/ui/button/button";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import IngredientForm from "~/features/ingredients/components/ingredient-form/ingredient-form";
import { useQueryIngredient } from "~/features/ingredients/api/use-query-ingredient";
import { useUpdateIngredientMutation } from "~/features/ingredients/api/use-update-ingredient-mutation";
import { useDeleteIngredientMutation } from "~/features/ingredients/api/use-delete-ingredient-mutation";
import { useModal } from "~/components/ui/modal/modal-context";
import { ConfirmDialog } from "~/components/ui/modal/confirm-dialog";
import type { CreateIngredientFormData } from "~/features/ingredients/schemas/create-ingredient-schema";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function ViewIngredientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { data, loading, error } = useQueryIngredient(id);
  const [updateIngredient, { loading: updateLoading, error: updateError }] =
    useUpdateIngredientMutation();
  const [deleteIngredient, { loading: deleteLoading }] =
    useDeleteIngredientMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const ingredient = data?.ingredient;

  const handleSubmit = async (formData: CreateIngredientFormData) => {
    const parsedPrice = formData.averagePrice
      ? parseFloat(formData.averagePrice)
      : undefined;

    await updateIngredient({
      variables: {
        id,
        input: {
          name: formData.name,
          description: formData.description || undefined,
          categories:
            formData.categories && formData.categories.length > 0
              ? formData.categories
              : undefined,
          defaultUnit: formData.defaultUnit || undefined,
          averagePrice:
            parsedPrice !== undefined && !isNaN(parsedPrice)
              ? parsedPrice
              : undefined,
          priceUnit: formData.priceUnit || undefined,
          priceCurrency: formData.priceCurrency || undefined,
        },
      },
    });
  };

  const handleDeleteClick = () => {
    const modalId = openModal(
      <ConfirmDialog
        title="Delete Ingredient"
        message={`Are you sure you want to delete "${ingredient?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await deleteIngredient({
              variables: { id },
            });
            closeModal(modalId);
            router.push(paths.dashboard.ingredients.getHref());
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
        <LoadingState message="Loading ingredient..." />
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className={styles.container}>
        <ErrorState message={error?.message || "Ingredient not found"} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title={ingredient.name} onBack={handleBack}>
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
        <IngredientForm
          initialData={{
            name: ingredient.name,
            description: ingredient.description || "",
            categories: ingredient.categories ?? [],
            defaultUnit: ingredient.defaultUnit || "",
            averagePrice: ingredient.averagePrice?.toString() || "",
            priceUnit: ingredient.priceUnit || "",
            priceCurrency: ingredient.priceCurrency || "USD",
          }}
          onSubmit={handleSubmit}
          loading={updateLoading}
          error={updateError?.message}
          submitButtonText="Update Ingredient"
          loadingText="Updating..."
        />
      </div>
    </div>
  );
}
