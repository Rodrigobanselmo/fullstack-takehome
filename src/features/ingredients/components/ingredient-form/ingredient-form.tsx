import { IngredientCategory } from "generated/gql/graphql";
import { useState } from "react";
import FormActions from "~/components/ui/forms/form-actions/form-actions";
import FormError from "~/components/ui/forms/form-error/form-error";
import SelectField from "~/components/ui/forms/select-field/select-field";
import TextField from "~/components/ui/forms/text-field/text-field";
import { extractGraphQLErrorMessage } from "~/lib/graphql-error";
import { INGREDIENT_CATEGORY_OPTIONS } from "../../constants/ingredient-category-map";
import {
  createIngredientSchema,
  type CreateIngredientFormData,
} from "../../schemas/create-ingredient-schema";
import styles from "./ingredient-form.module.css";

export interface IngredientFormProps {
  initialData?: CreateIngredientFormData;
  loading?: boolean;
  error?: string;
  onSubmit: (data: CreateIngredientFormData) => Promise<void>;
  submitButtonText?: string;
  loadingText?: string;
  onCancel?: () => void;
}

const initialIngredientData: CreateIngredientFormData = {
  name: "",
  description: "",
  category: undefined,
  defaultUnit: "",
  averagePrice: "",
  priceUnit: "",
  priceCurrency: "USD",
};

export default function IngredientForm({
  initialData = initialIngredientData,
  loading = false,
  error = "",
  onSubmit,
  submitButtonText = "Create Ingredient",
  loadingText = "Creating Ingredient...",
  onCancel,
}: IngredientFormProps) {
  const [formData, setFormData] =
    useState<CreateIngredientFormData>(initialData);
  const [formError, setFormError] = useState<string>(error);

  const handleInputChange =
    (name: keyof CreateIngredientFormData) =>
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      category: e.target.value as IngredientCategory,
    }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const validationResult = createIngredientSchema.safeParse(formData);
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

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formSection}>
        <TextField
          label="Ingredient Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange("name")}
          placeholder="Enter ingredient name..."
          required={true}
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description || ""}
          onChange={handleInputChange("description")}
          placeholder="Enter description..."
          multiline={true}
          maxLines={3}
        />
        <SelectField
          label="Category"
          name="category"
          value={formData.category || ""}
          onChange={handleCategoryChange}
          options={INGREDIENT_CATEGORY_OPTIONS}
          placeholder="Select category..."
        />
        <TextField
          label="Default Unit"
          name="defaultUnit"
          value={formData.defaultUnit || ""}
          onChange={handleInputChange("defaultUnit")}
          placeholder="e.g., cups, tbsp, grams..."
        />
      </div>

      <div className={styles.pricingSection}>
        <h3 className={styles.sectionTitle}>Pricing Information</h3>
        <div className={styles.pricingGrid}>
          <TextField
            label="Average Price"
            name="averagePrice"
            type="number"
            value={formData.averagePrice || ""}
            onChange={handleInputChange("averagePrice")}
            placeholder="0.00"
          />
          <TextField
            label="Price Unit"
            name="priceUnit"
            value={formData.priceUnit || ""}
            onChange={handleInputChange("priceUnit")}
            placeholder="e.g., lb, kg, unit..."
          />
          <TextField
            label="Currency"
            name="priceCurrency"
            value={formData.priceCurrency || ""}
            onChange={handleInputChange("priceCurrency")}
            placeholder="USD"
          />
        </div>
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
