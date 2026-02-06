import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FragmentType } from "generated/gql/fragment-masking";
import { useFragment } from "generated/gql/fragment-masking";
import type { RecipeGroupFormFragment } from "generated/gql/graphql";
import { RecipeGroupFormFragmentDoc } from "generated/gql/graphql";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import FormActions from "~/components/ui/forms/form-actions/form-actions";
import FormError from "~/components/ui/forms/form-error/form-error";
import MultiSelectField from "~/components/ui/forms/multi-select-field/multi-select-field";
import TextField from "~/components/ui/forms/text-field/text-field";
import { useToast } from "~/components/ui/toast";
import { extractGraphQLErrorMessage } from "~/lib/graphql-error";
import { useQueryRecipes } from "~/features/recipes/api/use-query-recipes";
import {
  createRecipeGroupSchema,
  type CreateRecipeGroupFormData,
} from "../../schemas/create-recipe-group-schema";
import styles from "./recipe-group-form.module.css";

export const RECIPE_GROUP_FORM_FRAGMENT = gql`
  fragment RecipeGroupForm on RecipeGroup {
    id
    name
    description
    recipes {
      id
      name
    }
  }
`;

export interface RecipeGroupFormProps {
  recipeGroup?: FragmentType<typeof RecipeGroupFormFragmentDoc>;
  loading?: boolean;
  error?: string;
  onSubmit: (data: CreateRecipeGroupFormData) => Promise<void>;
  onSuccess?: () => void;
  submitButtonText?: string;
  loadingText?: string;
  onCancel?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

function getDefaultValues(
  recipeGroupData?: RecipeGroupFormFragment,
): CreateRecipeGroupFormData {
  if (!recipeGroupData) {
    return {
      name: "",
      description: "",
      recipeIds: [],
    };
  }

  return {
    name: recipeGroupData.name,
    description: recipeGroupData.description || "",
    recipeIds: recipeGroupData.recipes.map((r) => r.id),
  };
}

export default function RecipeGroupForm({
  recipeGroup,
  loading = false,
  error = "",
  onSubmit,
  onSuccess,
  submitButtonText = "Create Recipe Group",
  loadingText = "Creating Recipe Group...",
  onCancel,
  successMessage = "Recipe group saved successfully!",
  errorMessage = "Failed to save recipe group",
}: RecipeGroupFormProps) {
  const recipeGroupData = useFragment(RecipeGroupFormFragmentDoc, recipeGroup);
  const [formError, setFormError] = useState<string>(error);
  const { data: recipesData, loading: recipesLoading } = useQueryRecipes();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRecipeGroupFormData>({
    resolver: zodResolver(createRecipeGroupSchema),
    defaultValues: getDefaultValues(recipeGroupData),
  });

  const onFormSubmit = async (data: CreateRecipeGroupFormData) => {
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

  const recipeOptions =
    recipesData?.recipes?.map((recipe) => ({
      value: recipe.id,
      label: recipe.name,
    })) ?? [];

  const firstError = errors ? Object.entries(errors)[0]?.[1]?.message : null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <div className={styles.formSection}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              label="Group Name"
              name="name"
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter group name..."
              required={true}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              label="Description"
              name="description"
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Enter group description..."
              multiline={true}
              maxLines={3}
            />
          )}
        />
        <Controller
          name="recipeIds"
          control={control}
          render={({ field }) => (
            <MultiSelectField
              label="Recipes"
              name="recipeIds"
              value={field.value ?? []}
              onChange={field.onChange}
              options={recipeOptions}
              placeholder="Select recipes..."
              disabled={recipesLoading}
            />
          )}
        />
      </div>
      <FormError error={formError || firstError || ""} />
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
