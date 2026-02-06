import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FragmentType } from "generated/gql/fragment-masking";
import { useFragment } from "generated/gql/fragment-masking";
import type { RecipeFormFragment, RecipeTag } from "generated/gql/graphql";
import { RecipeFormFragmentDoc } from "generated/gql/graphql";
import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Button from "~/components/ui/button/button";
import CheckboxField from "~/components/ui/forms/checkbox-field/checkbox-field";
import FormActions from "~/components/ui/forms/form-actions/form-actions";
import MarkdownEditor from "~/components/ui/forms/markdown-editor/markdown-editor";
import FormError from "~/components/ui/forms/form-error/form-error";
import MultiSelectField from "~/components/ui/forms/multi-select-field/multi-select-field";
import SelectField from "~/components/ui/forms/select-field/select-field";
import TextField from "~/components/ui/forms/text-field/text-field";
import { useToast } from "~/components/ui/toast";
import { extractGraphQLErrorMessage } from "~/lib/graphql-error";
import { useQueryIngredients } from "~/features/ingredients/api/use-query-ingredients";
import { RECIPE_TAG_OPTIONS } from "../../constants/recipe-tag-map";
import {
  createRecipeSchema,
  type CreateRecipeFormData,
} from "../../schemas/create-recipe-schema";
import styles from "./recipe-form.module.css";

export const RECIPE_FORM_FRAGMENT = gql`
  fragment RecipeForm on Recipe {
    id
    name
    servings
    tags
    overallRating
    prepTimeMinutes
    instructions
    ingredients {
      id
      ingredientId
      quantity
      unit
      notes
      optional
      price
    }
  }
`;

export interface RecipeFormProps {
  recipe?: FragmentType<typeof RecipeFormFragmentDoc>;
  loading?: boolean;
  error?: string;
  onSubmit: (data: CreateRecipeFormData) => Promise<void>;
  onSuccess?: () => void;
  submitButtonText?: string;
  loadingText?: string;
  onCancel?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

function getDefaultValues(
  recipeData?: RecipeFormFragment,
): CreateRecipeFormData {
  if (!recipeData) {
    return {
      name: "",
      servings: "4",
      tags: [],
      overallRating: "",
      prepTimeMinutes: "",
      instructions: "",
      ingredients: [],
    };
  }

  return {
    name: recipeData.name,
    servings: recipeData.servings.toString(),
    tags: recipeData.tags,
    overallRating: recipeData.overallRating?.toString() || "",
    prepTimeMinutes: recipeData.prepTimeMinutes?.toString() || "",
    instructions: recipeData.instructions || "",
    ingredients: recipeData.ingredients.map((ing) => ({
      ingredientId: ing.ingredientId,
      quantity: ing.quantity.toString(),
      unit: ing.unit,
      notes: ing.notes || "",
      optional: ing.optional || false,
      price: ing.price?.toString() || "",
    })),
  };
}

export default function RecipeForm({
  recipe,
  loading = false,
  error = "",
  onSubmit,
  onSuccess,
  submitButtonText = "Create Recipe",
  loadingText = "Creating Recipe...",
  onCancel,
  successMessage = "Recipe saved successfully!",
  errorMessage = "Failed to save recipe",
}: RecipeFormProps) {
  const recipeData = useFragment(RecipeFormFragmentDoc, recipe);
  const [formError, setFormError] = useState<string>(error);
  const { data: ingredientsQueryData, loading: ingredientsLoading } =
    useQueryIngredients();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRecipeFormData>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: getDefaultValues(recipeData),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const onFormSubmit = async (data: CreateRecipeFormData) => {
    try {
      await onSubmit(data);
      toast.success(successMessage);
      onSuccess?.();
    } catch (err) {
      const errorMsg = extractGraphQLErrorMessage(err);
      setFormError(errorMsg);
      toast.error(errorMessage, errorMsg);
    }
  };

  const ingredientOptions =
    ingredientsQueryData?.ingredients?.edges.map((edge) => ({
      value: edge.node.id,
      label: edge.node.name,
    })) ?? [];

  const firstError = errors
    ? Object.entries(errors)[0]?.[1]?.message ||
      (errors.ingredients as { root?: { message?: string } })?.root?.message
    : null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <div className={styles.formSection}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              label="Recipe Name"
              name="name"
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter recipe name..."
              required={true}
            />
          )}
        />
        <Controller
          name="servings"
          control={control}
          render={({ field }) => (
            <TextField
              label="Servings"
              name="servings"
              type="number"
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter number of servings..."
              required={true}
            />
          )}
        />
        <Controller
          name="prepTimeMinutes"
          control={control}
          render={({ field }) => (
            <TextField
              label="Prep Time (minutes)"
              name="prepTimeMinutes"
              type="number"
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Enter prep time..."
            />
          )}
        />
        <Controller
          name="overallRating"
          control={control}
          render={({ field }) => (
            <TextField
              label="Overall Rating (1-5)"
              name="overallRating"
              type="number"
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Enter rating..."
            />
          )}
        />
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <MultiSelectField
              label="Tags"
              name="tags"
              value={(field.value as RecipeTag[]) ?? []}
              onChange={(values) => field.onChange(values as RecipeTag[])}
              options={RECIPE_TAG_OPTIONS}
              placeholder="Select tags..."
            />
          )}
        />
      </div>

      <Controller
        name="instructions"
        control={control}
        render={({ field }) => (
          <MarkdownEditor
            label="Instructions"
            name="instructions"
            value={field.value || ""}
            onChange={field.onChange}
            placeholder="Write your recipe instructions here...&#10;&#10;# Example&#10;&#10;1. Preheat oven to 350°F&#10;2. Mix ingredients&#10;&#10;**Tips:** Use fresh ingredients for best results."
          />
        )}
      />

      <div className={styles.ingredientsSection}>
        <div className={styles.ingredientsHeader}>
          <h3>Ingredients</h3>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                ingredientId: "",
                quantity: "",
                unit: "",
                notes: "",
                optional: false,
                price: "",
              })
            }
          >
            + Add Ingredient
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className={styles.ingredientRow}>
            <Controller
              name={`ingredients.${index}.ingredientId`}
              control={control}
              render={({ field: f }) => (
                <SelectField
                  label="Ingredient"
                  name={`ingredient-${index}`}
                  value={f.value}
                  onChange={f.onChange}
                  options={ingredientOptions}
                  placeholder="Select ingredient..."
                  required={true}
                  disabled={ingredientsLoading}
                />
              )}
            />
            <Controller
              name={`ingredients.${index}.quantity`}
              control={control}
              render={({ field: f }) => (
                <TextField
                  label="Quantity"
                  name={`quantity-${index}`}
                  type="number"
                  value={f.value}
                  onChange={f.onChange}
                  placeholder="Amount..."
                  required={true}
                />
              )}
            />
            <Controller
              name={`ingredients.${index}.unit`}
              control={control}
              render={({ field: f }) => (
                <TextField
                  label="Unit"
                  name={`unit-${index}`}
                  value={f.value}
                  onChange={f.onChange}
                  placeholder="cups, tbsp, etc..."
                  required={true}
                />
              )}
            />
            <Controller
              name={`ingredients.${index}.notes`}
              control={control}
              render={({ field: f }) => (
                <TextField
                  label="Notes"
                  name={`notes-${index}`}
                  value={f.value || ""}
                  onChange={f.onChange}
                  placeholder="Optional notes..."
                />
              )}
            />
            <Controller
              name={`ingredients.${index}.price`}
              control={control}
              render={({ field: f }) => (
                <TextField
                  label="Price"
                  name={`price-${index}`}
                  type="number"
                  value={f.value || ""}
                  onChange={f.onChange}
                  placeholder="0.00"
                />
              )}
            />
            <Controller
              name={`ingredients.${index}.optional`}
              control={control}
              render={({ field: f }) => (
                <CheckboxField
                  label="Optional"
                  name={`optional-${index}`}
                  checked={f.value ?? false}
                  onChange={f.onChange}
                />
              )}
            />
            <Button
              type="button"
              variant="outline"
              color="danger"
              size="sm"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <FormError error={formError || firstError! || ""} />
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
