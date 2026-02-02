"use client";

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
  params: { id: string };
}) {
  const router = useRouter();
  const { data, loading, error } = useQueryRecipeGroup(params.id);
  const [deleteRecipeGroup, { loading: deleteLoading }] =
    useDeleteRecipeGroupMutation();

  const recipeGroup = data?.recipeGroup;

  const handleEdit = () => {
    router.push(paths.dashboard.recipeGroups.edit.getHref(params.id));
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe group?")) {
      return;
    }

    await deleteRecipeGroup({
      variables: { id: params.id },
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
        <ErrorState
          title="Failed to load recipe group"
          message={error?.message || "Recipe group not found"}
        />
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
        <RecipeGroupView
          name={recipeGroup.name}
          description={recipeGroup.description}
          recipes={recipeGroup.recipes || []}
        />
      </div>
    </div>
  );
}
