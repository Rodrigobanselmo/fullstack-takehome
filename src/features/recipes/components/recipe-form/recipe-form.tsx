import { gql } from "@apollo/client";
import type { FragmentType } from "generated/gql/fragment-masking";
import { useFragment } from "generated/gql/fragment-masking";
import {
  type RecipeTag,
  RecipeFormFragmentDoc,
  RecipeFormIngredientFragmentDoc,
} from "generated/gql/graphql";
import { useState } from "react";
import FormActions from "~/components/ui/forms/form-actions/form-actions";
import FormError from "~/components/ui/forms/form-error/form-error";
import MultiSelectField from "~/components/ui/forms/multi-select-field/multi-select-field";
import SelectField from "~/components/ui/forms/select-field/select-field";
import TextField from "~/components/ui/forms/text-field/text-field";
import { extractGraphQLErrorMessage } from "~/lib/graphql-error";
import { useQueryIngredients } from "~/features/ingredients/api/use-query-ingredients";
import { RECIPE_TAG_OPTIONS } from "../../constants/recipe-tag-map";
import {
  createRecipeSchema,
  type CreateRecipeFormData,
  type RecipeIngredientFormData,
} from "../../schemas/create-recipe-schema";
import styles from "./recipe-form.module.css";

export const RECIPE_FORM_INGREDIENT_FRAGMENT = gql`
  fragment RecipeFormIngredient on RecipeIngredient {
    id
    ingredientId
    quantity
    unit
    notes
    optional
  }
`;

export const RECIPE_FORM_FRAGMENT = gql`
  fragment RecipeForm on Recipe {
    id
    name
    servings
    tags
    overallRating
    prepTimeMinutes
    ingredients {
      ...RecipeFormIngredient
    }
  }
  ${RECIPE_FORM_INGREDIENT_FRAGMENT}
`;

export interface RecipeFormProps {
  recipe?: FragmentType<typeof RecipeFormFragmentDoc>;
  loading?: boolean;
  error?: string;
  onSubmit: (data: CreateRecipeFormData) => Promise<void>;
  submitButtonText?: string;
  loadingText?: string;
  onCancel?: () => void;
}

const initialRecipeData: CreateRecipeFormData = {
  name: "",
  servings: "4",
  tags: [],
  overallRating: "",
  prepTimeMinutes: "",
  ingredients: [],
};

const initialIngredient: RecipeIngredientFormData = {
  ingredientId: "",
  quantity: "",
  unit: "",
  notes: "",
  optional: false,
};

function getInitialData(
  recipeData:
    | {
        name: string;
        servings: number;
        tags: RecipeTag[];
        overallRating?: number | null;
        prepTimeMinutes?: number | null;
      }
    | undefined,
  ingredientsData: ReadonlyArray<{
    ingredientId: string;
    quantity: number;
    unit: string;
    notes?: string | null;
    optional?: boolean | null;
  }>,
): CreateRecipeFormData {
  if (!recipeData) return initialRecipeData;

  return {
    name: recipeData.name,
    servings: recipeData.servings.toString(),
    tags: recipeData.tags,
    overallRating: recipeData.overallRating?.toString() || "",
    prepTimeMinutes: recipeData.prepTimeMinutes?.toString() || "",
    ingredients: ingredientsData.map((ing) => ({
      ingredientId: ing.ingredientId,
      quantity: ing.quantity.toString(),
      unit: ing.unit,
      notes: ing.notes || "",
      optional: ing.optional || false,
    })),
  };
}

export default function RecipeForm({
  recipe,
  loading = false,
  error = "",
  onSubmit,
  submitButtonText = "Create Recipe",
  loadingText = "Creating Recipe...",
  onCancel,
}: RecipeFormProps) {
  const recipeData = useFragment(RecipeFormFragmentDoc, recipe);
  const recipeIngredientsData = useFragment(
    RecipeFormIngredientFragmentDoc,
    recipeData?.ingredients ?? [],
  );
  const initialData = getInitialData(recipeData, recipeIngredientsData);

  const [formData, setFormData] = useState<CreateRecipeFormData>(initialData);
  const [formError, setFormError] = useState<string>(error);
  const { data: ingredientsQueryData, loading: ingredientsLoading } =
    useQueryIngredients();

  const handleInputChange =
    (name: keyof CreateRecipeFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.value,
      }));
      setFormError("");
    };

  const handleTagsChange = (selectedTags: string[]) => {
    setFormData((prev) => ({
      ...prev,
      tags: selectedTags as RecipeTag[],
    }));
    setFormError("");
  };

  const handleAddIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...initialIngredient }],
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof RecipeIngredientFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing,
      ),
    }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const validationResult = createRecipeSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      const message = firstError
        ? `${firstError.path.join(".")}: ${firstError.message}`
        : "Validation failed";

      setFormError(message);
      return;
    }

    try {
      await onSubmit(validationResult.data);
    } catch (error) {
      setFormError(extractGraphQLErrorMessage(error));
    }
  };

  const ingredientOptions =
    ingredientsQueryData?.ingredients?.map((ingredient) => ({
      value: ingredient.id,
      label: ingredient.name,
    })) ?? [];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formSection}>
        <TextField
          label="Recipe Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange("name")}
          placeholder="Enter recipe name..."
          required={true}
        />
        <TextField
          label="Servings"
          name="servings"
          type="number"
          value={formData.servings}
          onChange={handleInputChange("servings")}
          placeholder="Enter number of servings..."
          required={true}
        />
        <TextField
          label="Prep Time (minutes)"
          name="prepTimeMinutes"
          type="number"
          value={formData.prepTimeMinutes || ""}
          onChange={handleInputChange("prepTimeMinutes")}
          placeholder="Enter prep time..."
        />
        <TextField
          label="Overall Rating (1-5)"
          name="overallRating"
          type="number"
          value={formData.overallRating || ""}
          onChange={handleInputChange("overallRating")}
          placeholder="Enter rating..."
        />
        <MultiSelectField
          label="Tags"
          name="tags"
          value={formData.tags ?? []}
          onChange={handleTagsChange}
          options={RECIPE_TAG_OPTIONS}
          placeholder="Select tags..."
        />
      </div>

      <div className={styles.ingredientsSection}>
        <div className={styles.ingredientsHeader}>
          <h3>Ingredients</h3>
          <button
            type="button"
            onClick={handleAddIngredient}
            className={styles.addButton}
          >
            + Add Ingredient
          </button>
        </div>

        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className={styles.ingredientRow}>
            <SelectField
              label="Ingredient"
              name={`ingredient-${index}`}
              value={ingredient.ingredientId}
              onChange={(e) =>
                handleIngredientChange(index, "ingredientId", e.target.value)
              }
              options={ingredientOptions}
              placeholder="Select ingredient..."
              required={true}
              disabled={ingredientsLoading}
            />
            <TextField
              label="Quantity"
              name={`quantity-${index}`}
              type="number"
              value={ingredient.quantity}
              onChange={(e) =>
                handleIngredientChange(index, "quantity", e.target.value)
              }
              placeholder="Amount..."
              required={true}
            />
            <TextField
              label="Unit"
              name={`unit-${index}`}
              value={ingredient.unit}
              onChange={(e) =>
                handleIngredientChange(index, "unit", e.target.value)
              }
              placeholder="cups, tbsp, etc..."
              required={true}
            />
            <TextField
              label="Notes"
              name={`notes-${index}`}
              value={ingredient.notes || ""}
              onChange={(e) =>
                handleIngredientChange(index, "notes", e.target.value)
              }
              placeholder="Optional notes..."
            />
            <button
              type="button"
              onClick={() => handleRemoveIngredient(index)}
              className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <FormError error={formError} />
      <FormActions
        primaryAction={{
          text: loading ? loadingText : submitButtonText,
          variant: "fill",
          color: "primary",
          size: "lg",
          minWidth: "150px",
          loading: loading,
        }}
        secondaryAction={
          onCancel
            ? {
                text: "Cancel",
                onClick: onCancel,
                variant: "outline",
                color: "grey",
                size: "lg",
                minWidth: "150px",
              }
            : undefined
        }
      />
    </form>
  );
}
