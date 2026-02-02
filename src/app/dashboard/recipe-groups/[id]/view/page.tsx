"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import Button from "~/components/ui/button/button";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import RecipeGroupView from "~/features/recipe-groups/components/recipe-group-view/recipe-group-view";
import { useQueryRecipeGroup } from "~/features/recipe-groups/api/use-query-recipe-group";
import { useDeleteRecipeGroupMutation } from "~/features/recipe-groups/api/use-delete-recipe-group-mutation";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function ViewRecipeGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error } = useQueryRecipeGroup(id);
  const [deleteRecipeGroup, { loading: deleteLoading }] =
    useDeleteRecipeGroupMutation();

  const recipeGroup = data?.recipeGroup;

  const handleEdit = () => {
    router.push(paths.dashboard.recipeGroups.edit.getHref(id));
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe group?")) {
      return;
    }

    await deleteRecipeGroup({
      variables: { id },
    });

    router.push(paths.dashboard.recipes.getHref());
  };

  const handleBack = () => {
    router.push(paths.dashboard.recipes.getHref());
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
          <Button onClick={handleEdit} variant="outline" color="primary">
            Edit Group
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            color="danger"
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </PageHeader>
      <div className={styles.content}>
        <RecipeGroupView recipeGroup={recipeGroup} />
      </div>
    </div>
  );
}
