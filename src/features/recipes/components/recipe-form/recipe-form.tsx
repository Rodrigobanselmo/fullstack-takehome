import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FragmentType } from "generated/gql/fragment-masking";
import { useFragment } from "generated/gql/fragment-masking";
import type { RecipeFormFragment, RecipeTag } from "generated/gql/graphql";
import { RecipeFormFragmentDoc } from "generated/gql/graphql";
import { useCallback, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Button from "~/components/ui/button/button";
import CheckboxField from "~/components/ui/forms/checkbox-field/checkbox-field";
import FormActions from "~/components/ui/forms/form-actions/form-actions";
import FormError from "~/components/ui/forms/form-error/form-error";
import ImageUploadField from "~/components/ui/forms/image-upload-field/image-upload-field";
import MarkdownEditor from "~/components/ui/forms/markdown-editor/markdown-editor";
import MultiSelectField from "~/components/ui/forms/multi-select-field/multi-select-field";
import SelectField from "~/components/ui/forms/select-field/select-field";
import TextField from "~/components/ui/forms/text-field/text-field";
import { useToast } from "~/components/ui/toast";
import { useQueryIngredients } from "~/features/ingredients/api/use-query-ingredients";
import { extractGraphQLErrorMessage } from "~/lib/graphql-error";
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
    image {
      id
      url
      filename
    }
  }
`;

export interface RecipeFormProps {
  recipe?: FragmentType<typeof RecipeFormFragmentDoc>;
  loading?: boolean;
  error?: string;
  onSubmit: (data: CreateRecipeFormData) => Promise<void>;
  onImageUpload: (file: File) => Promise<string>; // Returns fileId
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
      imageFileId: null,
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
    imageFileId: recipeData.image?.id || null,
  };
}

export default function RecipeForm({
  recipe,
  loading = false,
  error = "",
  onSubmit,
  onImageUpload,
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

  const onFormError = useCallback(
    (fieldErrors: FieldErrors<CreateRecipeFormData>) => {
      const firstErrorKey = Object.keys(fieldErrors)[0];
      if (firstErrorKey) {
        const element = document.querySelector(`[name="${firstErrorKey}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Delay focus to allow smooth scroll to complete
          setTimeout(() => {
            (element as HTMLElement).focus?.();
          }, 800);
        }
      }
    },
    [],
  );

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
    <form
      onSubmit={handleSubmit(onFormSubmit, onFormError)}
      className={styles.form}
    >
      <div className={styles.formSection}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              label="Recipe Name"
              name="name"
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter recipe name..."
              required={true}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="servings"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              label="Servings"
              name="servings"
              type="number"
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter number of servings..."
              required={true}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="prepTimeMinutes"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              label="Prep Time (minutes)"
              name="prepTimeMinutes"
              type="number"
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Enter prep time..."
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="overallRating"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              label="Overall Rating (1-5)"
              name="overallRating"
              type="number"
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Enter rating..."
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="tags"
          control={control}
          render={({ field, fieldState }) => (
            <MultiSelectField
              label="Tags"
              name="tags"
              value={(field.value as RecipeTag[]) ?? []}
              onChange={(values) => field.onChange(values as RecipeTag[])}
              options={RECIPE_TAG_OPTIONS}
              placeholder="Select tags..."
              error={fieldState.error?.message}
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

      <Controller
        name="imageFileId"
        control={control}
        render={({ field }) => (
          <ImageUploadField
            label="Recipe Image"
            name="recipeImage"
            value={recipeData?.image?.url || null}
            onChange={field.onChange}
            onUpload={onImageUpload}
            disabled={loading}
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
              render={({ field: f, fieldState }) => (
                <SelectField
                  label="Ingredient"
                  name={`ingredient-${index}`}
                  value={f.value}
                  onChange={f.onChange}
                  options={ingredientOptions}
                  placeholder="Select ingredient..."
                  required={true}
                  disabled={ingredientsLoading}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name={`ingredients.${index}.quantity`}
              control={control}
              render={({ field: f, fieldState }) => (
                <TextField
                  label="Quantity"
                  name={`quantity-${index}`}
                  type="number"
                  value={f.value}
                  onChange={f.onChange}
                  placeholder="Amount..."
                  required={true}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name={`ingredients.${index}.unit`}
              control={control}
              render={({ field: f, fieldState }) => (
                <TextField
                  label="Unit"
                  name={`unit-${index}`}
                  value={f.value}
                  onChange={f.onChange}
                  placeholder="cups, tbsp, etc..."
                  required={true}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name={`ingredients.${index}.notes`}
              control={control}
              render={({ field: f, fieldState }) => (
                <TextField
                  label="Notes"
                  name={`notes-${index}`}
                  value={f.value || ""}
                  onChange={f.onChange}
                  placeholder="Optional notes..."
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name={`ingredients.${index}.price`}
              control={control}
              render={({ field: f, fieldState }) => (
                <TextField
                  label="Price"
                  name={`price-${index}`}
                  type="number"
                  value={f.value || ""}
                  onChange={f.onChange}
                  placeholder="0.00"
                  error={fieldState.error?.message}
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
