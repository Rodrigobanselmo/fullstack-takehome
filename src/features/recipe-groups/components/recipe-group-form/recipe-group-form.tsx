import { useState } from "react";
import FormActions from "~/components/ui/forms/form-actions/form-actions";
import FormError from "~/components/ui/forms/form-error/form-error";
import SelectField from "~/components/ui/forms/select-field/select-field";
import TextField from "~/components/ui/forms/text-field/text-field";
import { extractGraphQLErrorMessage } from "~/lib/graphql-error";
import { useQueryRecipes } from "~/features/recipes/api/use-query-recipes";
import {
  createRecipeGroupSchema,
  type CreateRecipeGroupFormData,
} from "../../schemas/create-recipe-group-schema";
import styles from "./recipe-group-form.module.css";

export interface RecipeGroupFormProps {
  initialData?: CreateRecipeGroupFormData;
  loading?: boolean;
  error?: string;
  onSubmit: (data: CreateRecipeGroupFormData) => Promise<void>;
  submitButtonText?: string;
  loadingText?: string;
  onCancel?: () => void;
}

const initialRecipeGroupData: CreateRecipeGroupFormData = {
  name: "",
  description: "",
  recipeIds: [],
};

export default function RecipeGroupForm({
  initialData = initialRecipeGroupData,
  loading = false,
  error = "",
  onSubmit,
  submitButtonText = "Create Recipe Group",
  loadingText = "Creating Recipe Group...",
  onCancel,
}: RecipeGroupFormProps) {
  const [formData, setFormData] =
    useState<CreateRecipeGroupFormData>(initialData);
  const [formError, setFormError] = useState<string>(error);
  const { data: recipesData, loading: recipesLoading } = useQueryRecipes();

  const handleInputChange =
    (name: keyof CreateRecipeGroupFormData) =>
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

  const handleRecipesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFormData((prev) => ({
      ...prev,
      recipeIds: selectedOptions,
    }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const validationResult = createRecipeGroupSchema.safeParse(formData);
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

  const recipeOptions =
    recipesData?.recipes?.map((recipe) => ({
      value: recipe.id,
      label: recipe.name,
    })) ?? [];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formSection}>
        <TextField
          label="Group Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange("name")}
          placeholder="Enter group name..."
          required={true}
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description || ""}
          onChange={handleInputChange("description")}
          placeholder="Enter group description..."
          multiline={true}
          maxLines={3}
        />
        <SelectField
          label="Recipes"
          name="recipeIds"
          value={formData.recipeIds?.[0] || ""}
          onChange={handleRecipesChange}
          options={recipeOptions}
          placeholder="Select recipes..."
          multiple={true}
          disabled={recipesLoading}
        />
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
