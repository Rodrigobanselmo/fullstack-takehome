"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import RecipeGroupForm from "~/features/recipe-groups/components/recipe-group-form/recipe-group-form";
import { useCreateRecipeGroupMutation } from "~/features/recipe-groups/api/use-create-recipe-group-mutation";
import type { CreateRecipeGroupFormData } from "~/features/recipe-groups/schemas/create-recipe-group-schema";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function AddRecipeGroupPage() {
  const router = useRouter();
  const [createRecipeGroup, { loading }] = useCreateRecipeGroupMutation();
  const createdIdRef = useRef<string | null>(null);

  const handleSubmit = async (data: CreateRecipeGroupFormData) => {
    const result = await createRecipeGroup({
      variables: {
        input: {
          name: data.name,
          description: data.description,
          recipeIds: data.recipeIds,
        },
      },
    });

    if (result.data?.createRecipeGroup) {
      createdIdRef.current = result.data.createRecipeGroup.id;
    }
  };

  const handleSuccess = () => {
    if (createdIdRef.current) {
      router.push(
        paths.dashboard.recipeGroups.view.getHref(createdIdRef.current),
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Create Recipe Group" onBack={handleCancel} />
      <div className={styles.formContainer}>
        <RecipeGroupForm
          onSubmit={handleSubmit}
          onSuccess={handleSuccess}
          loading={loading}
          onCancel={handleCancel}
          submitButtonText="Create Group"
          loadingText="Creating Group..."
          successMessage="Recipe group created successfully!"
        />
      </div>
    </div>
  );
}
