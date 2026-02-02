"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import Button from "~/components/ui/button/button";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import EmptyState from "~/components/ui/empty-state/empty-state";
import RecipeCard from "~/features/recipes/components/recipe-card/recipe-card";
import RecipesGrid from "~/features/recipes/components/recipes-grid/recipes-grid";
import RecipeGroupCard from "~/features/recipe-groups/components/recipe-group-card/recipe-group-card";
import RecipeGroupsGrid from "~/features/recipe-groups/components/recipe-groups-grid/recipe-groups-grid";
import { useQueryRecipes } from "~/features/recipes/api/use-query-recipes";
import { useQueryRecipeGroups } from "~/features/recipe-groups/api/use-query-recipe-groups";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function RecipesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"recipes" | "groups">("recipes");

  const {
    data: recipesData,
    loading: recipesLoading,
    error: recipesError,
  } = useQueryRecipes();
  const {
    data: groupsData,
    loading: groupsLoading,
    error: groupsError,
  } = useQueryRecipeGroups();

  const recipes = recipesData?.recipes ?? [];
  const groups = groupsData?.recipeGroups ?? [];

  const handleRecipeClick = (id: string) => {
    router.push(paths.dashboard.recipes.view.getHref(id));
  };

  const handleGroupClick = (id: string) => {
    router.push(paths.dashboard.recipeGroups.view.getHref(id));
  };

  const handleAddRecipe = () => {
    router.push(paths.dashboard.recipes.add.getHref());
  };

  const handleAddGroup = () => {
    router.push(paths.dashboard.recipeGroups.add.getHref());
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Recipes">
        <div className={styles.headerActions}>
          {activeTab === "recipes" ? (
            <Button onClick={handleAddRecipe} variant="fill" color="primary">
              + Add Recipe
            </Button>
          ) : (
            <Button onClick={handleAddGroup} variant="fill" color="primary">
              + Create Group
            </Button>
          )}
        </div>
      </PageHeader>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "recipes" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("recipes")}
        >
          📖 All Recipes ({recipes.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "groups" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          📚 Recipe Groups ({groups.length})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "recipes" && (
          <>
            {recipesLoading && <LoadingState message="Loading recipes..." />}
            {recipesError && (
              <ErrorState
                title="Failed to load recipes"
                message={recipesError.message}
              />
            )}
            {!recipesLoading && !recipesError && recipes.length === 0 && (
              <EmptyState
                title="No recipes yet"
                message="Create your first recipe to get started!"
              />
            )}
            {!recipesLoading && !recipesError && recipes.length > 0 && (
              <RecipesGrid>
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    name={recipe.name}
                    servings={recipe.servings}
                    tags={recipe.tags}
                    overallRating={recipe.overallRating}
                    prepTimeMinutes={recipe.prepTimeMinutes}
                    onClick={() => handleRecipeClick(recipe.id)}
                  />
                ))}
              </RecipesGrid>
            )}
          </>
        )}

        {activeTab === "groups" && (
          <>
            {groupsLoading && (
              <LoadingState message="Loading recipe groups..." />
            )}
            {groupsError && (
              <ErrorState
                title="Failed to load recipe groups"
                message={groupsError.message}
              />
            )}
            {!groupsLoading && !groupsError && groups.length === 0 && (
              <EmptyState
                title="No recipe groups yet"
                message="Create a group to organize your recipes!"
              />
            )}
            {!groupsLoading && !groupsError && groups.length > 0 && (
              <RecipeGroupsGrid>
                {groups.map((group) => (
                  <RecipeGroupCard
                    key={group.id}
                    name={group.name}
                    description={group.description}
                    recipeCount={0}
                    onClick={() => handleGroupClick(group.id)}
                  />
                ))}
              </RecipeGroupsGrid>
            )}
          </>
        )}
      </div>
    </div>
  );
}
