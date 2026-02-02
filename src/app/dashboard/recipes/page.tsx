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
import { useQueryRecipeGroups } from "~/features/recipe-groups/api/use-query-recipe-groups";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function RecipesPage() {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const {
    data: groupsData,
    loading: groupsLoading,
    error: groupsError,
  } = useQueryRecipeGroups();

  const groups = groupsData?.recipeGroups ?? [];

  const handleRecipeClick = (id: string) => {
    router.push(paths.dashboard.recipes.view.getHref(id));
  };

  const handleGroupToggle = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedGroups(new Set(groups.map((g) => g.id)));
  };

  const handleCollapseAll = () => {
    setExpandedGroups(new Set());
  };

  const handleViewGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(paths.dashboard.recipeGroups.view.getHref(id));
  };

  const handleAddRecipe = () => {
    router.push(paths.dashboard.recipes.add.getHref());
  };

  const handleAddGroup = () => {
    router.push(paths.dashboard.recipeGroups.add.getHref());
  };

  const totalRecipes = groups.reduce(
    (acc, group) => acc + (group.recipes?.length || 0),
    0,
  );

  const allExpanded = groups.length > 0 && expandedGroups.size === groups.length;

  return (
    <div className={styles.container}>
      <PageHeader title="Recipe Collections">
        <div className={styles.headerActions}>
          <Button onClick={handleAddRecipe} variant="outline" color="primary">
            + Add Recipe
          </Button>
          <Button onClick={handleAddGroup} variant="fill" color="primary">
            + New Collection
          </Button>
        </div>
      </PageHeader>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statsLeft}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{groups.length}</span>
            <span className={styles.statLabel}>Collections</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalRecipes}</span>
            <span className={styles.statLabel}>Recipes</span>
          </div>
        </div>
        {groups.length > 0 && (
          <div className={styles.expandControls}>
            <button
              className={styles.expandButton}
              onClick={allExpanded ? handleCollapseAll : handleExpandAll}
            >
              {allExpanded ? "Collapse All" : "Expand All"}
            </button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {groupsLoading && (
          <LoadingState message="Loading recipe collections..." />
        )}
        {groupsError && <ErrorState message={groupsError.message} />}

        {!groupsLoading && !groupsError && groups.length === 0 && (
          <EmptyState
            title="No recipe collections yet"
            message="Create your first collection to organize your recipes!"
          />
        )}

        {!groupsLoading && !groupsError && groups.length > 0 && (
          <div className={styles.groupsContainer}>
            {groups.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              const recipes = group.recipes || [];

              return (
                <div
                  key={group.id}
                  className={`${styles.groupCard} ${isExpanded ? styles.groupCardExpanded : ""}`}
                >
                  <div
                    className={styles.groupHeader}
                    onClick={() => handleGroupToggle(group.id)}
                  >
                    <div className={styles.groupInfo}>
                      <div className={styles.groupIcon}>
                        {recipes.length > 0 ? "📚" : "📁"}
                      </div>
                      <div className={styles.groupText}>
                        <h3 className={styles.groupTitle}>{group.name}</h3>
                        {group.description && (
                          <p className={styles.groupDescription}>
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={styles.groupActions}>
                      <span className={styles.recipeCount}>
                        {recipes.length}{" "}
                        {recipes.length === 1 ? "recipe" : "recipes"}
                      </span>
                      <button
                        className={styles.editButton}
                        onClick={(e) => handleViewGroup(group.id, e)}
                        title="View collection details"
                      >
                        🔍
                      </button>
                      <span
                        className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ""}`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.groupContent}>
                      {recipes.length === 0 ? (
                        <div className={styles.emptyRecipes}>
                          <p>No recipes in this collection yet.</p>
                          <Button
                            variant="outline"
                            color="primary"
                            onClick={handleAddRecipe}
                          >
                            + Add your first recipe
                          </Button>
                        </div>
                      ) : (
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
