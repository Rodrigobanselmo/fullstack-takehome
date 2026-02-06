"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import Button from "~/components/ui/button/button";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import EmptyState from "~/components/ui/empty-state/empty-state";
import TextField from "~/components/ui/forms/text-field/text-field";
import IngredientCard from "~/features/ingredients/components/ingredient-card/ingredient-card";
import IngredientsGrid from "~/features/ingredients/components/ingredients-grid/ingredients-grid";
import { useQueryIngredients } from "~/features/ingredients/api/use-query-ingredients";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function IngredientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading, error, fetchMore } = useQueryIngredients();

  const ingredients = data?.ingredients.edges.map((edge) => edge.node) ?? [];
  const pageInfo = data?.ingredients.pageInfo;

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleLoadMore = () => {
    if (pageInfo?.endCursor) {
      fetchMore({
        variables: { after: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            ingredients: {
              ...fetchMoreResult.ingredients,
              edges: [
                ...prev.ingredients.edges,
                ...fetchMoreResult.ingredients.edges,
              ],
            },
          };
        },
      });
    }
  };

  const handleAddIngredient = () => {
    router.push(paths.dashboard.ingredients.add.getHref());
  };

  const handleIngredientClick = (id: string) => {
    router.push(paths.dashboard.ingredients.view.getHref(id));
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Ingredients">
        <Button onClick={handleAddIngredient} variant="fill" color="primary">
          + Add Ingredient
        </Button>
      </PageHeader>

      <div className={styles.searchContainer}>
        <TextField
          label=""
          name="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ingredients..."
        />
        <p className={styles.resultCount}>
          {filteredIngredients.length} ingredient
          {filteredIngredients.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className={styles.content}>
        {loading && <LoadingState message="Loading ingredients..." />}
        {error && <ErrorState message={error.message} />}
        {!loading &&
          !error &&
          filteredIngredients.length === 0 &&
          searchQuery === "" && (
            <EmptyState
              title="No ingredients yet"
              message="Add your first ingredient to get started!"
            />
          )}
        {!loading &&
          !error &&
          filteredIngredients.length === 0 &&
          searchQuery !== "" && (
            <EmptyState
              title="No ingredients found"
              message={`No ingredients match "${searchQuery}"`}
            />
          )}
        {!loading && !error && filteredIngredients.length > 0 && (
          <>
            <IngredientsGrid>
              {filteredIngredients.map((ingredient) => (
                <IngredientCard
                  key={ingredient.id}
                  name={ingredient.name}
                  description={ingredient.description}
                  categories={ingredient.categories}
                  defaultUnit={ingredient.defaultUnit}
                  averagePrice={ingredient.averagePrice}
                  priceUnit={ingredient.priceUnit}
                  priceCurrency={ingredient.priceCurrency}
                  isSystem={ingredient.isSystem}
                  onClick={() => handleIngredientClick(ingredient.id)}
                />
              ))}
            </IngredientsGrid>
            {pageInfo?.hasNextPage && (
              <div className={styles.loadMoreContainer}>
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  color="primary"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
