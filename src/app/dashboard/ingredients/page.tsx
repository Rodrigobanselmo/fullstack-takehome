"use client";

import { useState } from "react";
import PageHeader from "~/components/ui/page-header/page-header";
import Button from "~/components/ui/button/button";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import EmptyState from "~/components/ui/empty-state/empty-state";
import TextField from "~/components/ui/forms/text-field/text-field";
import IngredientCard from "~/features/ingredients/components/ingredient-card/ingredient-card";
import IngredientsGrid from "~/features/ingredients/components/ingredients-grid/ingredients-grid";
import IngredientForm from "~/features/ingredients/components/ingredient-form/ingredient-form";
import { useQueryIngredients } from "~/features/ingredients/api/use-query-ingredients";
import { useCreateIngredientMutation } from "~/features/ingredients/api/use-create-ingredient-mutation";
import { useDeleteIngredientMutation } from "~/features/ingredients/api/use-delete-ingredient-mutation";
import type { CreateIngredientFormData } from "~/features/ingredients/schemas/create-ingredient-schema";
import styles from "./page.module.css";

export default function IngredientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    null,
  );

  const { data, loading, error } = useQueryIngredients();
  const [createIngredient, { loading: createLoading }] =
    useCreateIngredientMutation();
  const [deleteIngredient] = useDeleteIngredientMutation();

  const ingredients = data?.ingredients ?? [];

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddIngredient = async (formData: CreateIngredientFormData) => {
    const parsedPrice = formData.averagePrice
      ? parseFloat(formData.averagePrice)
      : undefined;

    const result = await createIngredient({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category || undefined,
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

    if (result.data) {
      setShowAddForm(false);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ingredient?")) {
      return;
    }

    await deleteIngredient({
      variables: { id },
    });
    setSelectedIngredient(null);
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Ingredients">
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="fill"
          color="primary"
        >
          {showAddForm ? "Cancel" : "+ Add Ingredient"}
        </Button>
      </PageHeader>

      {showAddForm && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Add New Ingredient</h2>
          <IngredientForm
            onSubmit={handleAddIngredient}
            loading={createLoading}
            onCancel={() => setShowAddForm(false)}
            submitButtonText="Add Ingredient"
            loadingText="Adding Ingredient..."
          />
        </div>
      )}

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
          <IngredientsGrid>
            {filteredIngredients.map((ingredient) => (
              <div key={ingredient.id} className={styles.ingredientCardWrapper}>
                <IngredientCard
                  name={ingredient.name}
                  description={ingredient.description}
                  category={ingredient.category}
                  defaultUnit={ingredient.defaultUnit}
                  averagePrice={ingredient.averagePrice}
                  priceUnit={ingredient.priceUnit}
                  priceCurrency={ingredient.priceCurrency}
                  onClick={() =>
                    setSelectedIngredient(
                      selectedIngredient === ingredient.id
                        ? null
                        : ingredient.id,
                    )
                  }
                />
                {selectedIngredient === ingredient.id && (
                  <div className={styles.ingredientActions}>
                    <Button
                      onClick={() => handleDeleteIngredient(ingredient.id)}
                      variant="outline"
                      color="danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </IngredientsGrid>
        )}
      </div>
    </div>
  );
}
