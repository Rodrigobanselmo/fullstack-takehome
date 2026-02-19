"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import Button from "~/components/ui/button/button";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import RecipeGroupForm from "~/features/recipe-groups/components/recipe-group-form/recipe-group-form";
import { useQueryRecipeGroup } from "~/features/recipe-groups/api/use-query-recipe-group";
import { useUpdateRecipeGroupMutation } from "~/features/recipe-groups/api/use-update-recipe-group-mutation";
import { useDeleteRecipeGroupMutation } from "~/features/recipe-groups/api/use-delete-recipe-group-mutation";
import { useModal } from "~/components/ui/modal/modal-context";
import { ConfirmDialog } from "~/components/ui/modal/confirm-dialog";
import type { CreateRecipeGroupFormData } from "~/features/recipe-groups/schemas/create-recipe-group-schema";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function ViewRecipeGroupPage({
  params,
}: {
  params: Promise<{ recipeGroupId: string }>;
}) {
  const { recipeGroupId: id } = use(params);
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { data, loading, error } = useQueryRecipeGroup(id);
  const [updateRecipeGroup, { loading: updateLoading, error: updateError }] =
    useUpdateRecipeGroupMutation();
  const [deleteRecipeGroup, { loading: deleteLoading }] =
    useDeleteRecipeGroupMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const recipeGroup = data?.recipeGroup;

  const handleSubmit = async (formData: CreateRecipeGroupFormData) => {
    await updateRecipeGroup({
      variables: {
        id,
        input: {
          name: formData.name,
          description: formData.description,
          recipeIds: formData.recipeIds,
        },
      },
    });
  };

  const handleDeleteClick = () => {
    const modalId = openModal(
      <ConfirmDialog
        title="Delete Recipe Group"
        message={`Are you sure you want to delete "${recipeGroup?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await deleteRecipeGroup({
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
        <LoadingState message="Loading recipe group..." />
      </div>
    );
  }

  if (error || !recipeGroup) {
    return (
      <div className={styles.container}>
        <ErrorState message={error?.message || "Recipe group not found"} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title={recipeGroup.name} onBack={handleBack}>
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
        <RecipeGroupForm
          recipeGroup={recipeGroup}
          onSubmit={handleSubmit}
          onSuccess={() => router.back()}
          loading={updateLoading}
          error={updateError?.message}
          submitButtonText="Update Group"
          loadingText="Updating..."
          successMessage="Recipe group updated successfully!"
        />
      </div>
    </div>
  );
}
