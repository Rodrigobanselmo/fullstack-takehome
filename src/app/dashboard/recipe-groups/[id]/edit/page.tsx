"use client";

import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import RecipeGroupForm from "~/features/recipe-groups/components/recipe-group-form/recipe-group-form";
import { useQueryRecipeGroup } from "~/features/recipe-groups/api/use-query-recipe-group";
import { useUpdateRecipeGroupMutation } from "~/features/recipe-groups/api/use-update-recipe-group-mutation";
import type { CreateRecipeGroupFormData } from "~/features/recipe-groups/schemas/create-recipe-group-schema";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function EditRecipeGroupPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQueryRecipeGroup(params.id);
  const [updateRecipeGroup, { loading: updateLoading, error: updateError }] =
    useUpdateRecipeGroupMutation();

  const recipeGroup = data?.recipeGroup;

  const handleSubmit = async (formData: CreateRecipeGroupFormData) => {
    const result = await updateRecipeGroup({
      variables: {
        id: params.id,
        input: {
          name: formData.name,
          description: formData.description,
          recipeIds: formData.recipeIds,
        },
      },
    });

    if (result.data?.updateRecipeGroup) {
      router.push(paths.dashboard.recipeGroups.view.getHref(params.id));
    }
  };

  const handleCancel = () => {
    router.push(paths.dashboard.recipeGroups.view.getHref(params.id));
  };

  if (queryLoading) {
    return (
      <div className={styles.container}>
        <LoadingState message="Loading recipe group..." />
      </div>
    );
  }

  if (queryError || !recipeGroup) {
    return (
      <div className={styles.container}>
        <ErrorState
          title="Failed to load recipe group"
          message={queryError?.message || "Recipe group not found"}
        />
      </div>
    );
  }

  const initialData: CreateRecipeGroupFormData = {
    name: recipeGroup.name,
    description: recipeGroup.description || "",
    recipeIds: recipeGroup.recipes?.map((r) => r.id) || [],
  };

  return (
    <div className={styles.container}>
      <PageHeader title={`Edit: ${recipeGroup.name}`} onBack={handleCancel} />
      <div className={styles.formContainer}>
        <RecipeGroupForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={updateLoading}
          error={updateError?.message}
          onCancel={handleCancel}
          submitButtonText="Update Group"
          loadingText="Updating Group..."
        />
      </div>
    </div>
  );
}
