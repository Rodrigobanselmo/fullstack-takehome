"use client";

import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import IngredientForm from "~/features/ingredients/components/ingredient-form/ingredient-form";
import { useCreateIngredientMutation } from "~/features/ingredients/api/use-create-ingredient-mutation";
import type { CreateIngredientFormData } from "~/features/ingredients/schemas/create-ingredient-schema";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function AddIngredientPage() {
  const router = useRouter();
  const [createIngredient, { loading }] = useCreateIngredientMutation();

  const handleSubmit = async (formData: CreateIngredientFormData) => {
    const parsedPrice = formData.averagePrice
      ? parseFloat(formData.averagePrice)
      : undefined;

    const result = await createIngredient({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || undefined,
          categories:
            formData.categories && formData.categories.length > 0
              ? formData.categories
              : undefined,
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

    if (result.data?.createIngredient) {
      router.push(
        paths.dashboard.ingredients.view.getHref(
          result.data.createIngredient.id,
        ),
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Add New Ingredient" onBack={handleCancel} />
      <div className={styles.formContainer}>
        <IngredientForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={handleCancel}
          submitButtonText="Create Ingredient"
          loadingText="Creating Ingredient..."
        />
      </div>
    </div>
  );
}
