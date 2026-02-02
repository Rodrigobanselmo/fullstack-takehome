"use client";

import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import Button from "~/components/ui/button/button";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import RecipeView from "~/features/recipes/components/recipe-view/recipe-view";
import { useQueryRecipe } from "~/features/recipes/api/use-query-recipe";
import { useDeleteRecipeMutation } from "~/features/recipes/api/use-delete-recipe-mutation";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function ViewRecipePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, loading, error } = useQueryRecipe(params.id);
  const [deleteRecipe, { loading: deleteLoading }] = useDeleteRecipeMutation();

  const recipe = data?.recipe;

  const handleEdit = () => {
    router.push(paths.dashboard.recipes.edit.getHref(params.id));
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    await deleteRecipe({
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
        <LoadingState message="Loading recipe..." />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className={styles.container}>
        <ErrorState
          title="Failed to load recipe"
          message={error?.message || "Recipe not found"}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title={recipe.name} onBack={handleBack}>
        <div className={styles.actions}>
          <Button onClick={handleEdit} variant="outline" color="primary">
            Edit Recipe
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
        <RecipeView
          name={recipe.name}
          servings={recipe.servings}
          tags={recipe.tags}
          overallRating={recipe.overallRating}
          prepTimeMinutes={recipe.prepTimeMinutes}
          ingredients={recipe.ingredients}
        />
      </div>
    </div>
  );
}
