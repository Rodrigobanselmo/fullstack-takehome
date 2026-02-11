"use client";

import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import RecipeForm from "~/features/recipes/components/recipe-form/recipe-form";
import { useCreateRecipeMutation } from "~/features/recipes/api/use-create-recipe-mutation";
import {
  useUploadFileMutation,
  uploadToS3,
  FileUploadType,
} from "~/features/files/api/use-upload-file-mutation";
import type { CreateRecipeFormData } from "~/features/recipes/schemas/create-recipe-schema";
import { paths } from "~/config/paths";
import styles from "./page.module.css";

export default function AddRecipePage() {
  const router = useRouter();
  const [createRecipe, { loading }] = useCreateRecipeMutation();
  const [uploadFile] = useUploadFileMutation();

  const handleImageUpload = async (file: File): Promise<string> => {
    // Get presigned URL from backend
    const { data } = await uploadFile({
      variables: {
        input: {
          filename: file.name,
          mimeType: file.type,
          type: FileUploadType.Recipe,
        },
      },
    });

    if (!data?.uploadFile.presignedPost) {
      throw new Error("Failed to get upload URL");
    }

    // Upload file to S3
    await uploadToS3(file, data.uploadFile.presignedPost);

    // Return the file ID
    return data.uploadFile.file.id;
  };

  const handleSubmit = async (data: CreateRecipeFormData) => {
    const result = await createRecipe({
      variables: {
        input: {
          name: data.name,
          servings: parseInt(data.servings),
          tags: data.tags,
          overallRating: data.overallRating
            ? parseInt(data.overallRating)
            : undefined,
          prepTimeMinutes: data.prepTimeMinutes
            ? parseInt(data.prepTimeMinutes)
            : undefined,
          instructions: data.instructions || undefined,
          imageFileId: data.imageFileId || undefined,
          ingredients: data.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: parseFloat(ing.quantity),
            unit: ing.unit,
            notes: ing.notes,
            optional: ing.optional,
            price: ing.price ? parseFloat(ing.price) : undefined,
          })),
        },
      },
    });

    const recipeId = result.data?.createRecipe?.id;

    if (recipeId) {
      router.push(paths.dashboard.recipes.view.getHref(recipeId));
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Add New Recipe" onBack={handleCancel} />
      <div className={styles.formContainer}>
        <RecipeForm
          onSubmit={handleSubmit}
          onImageUpload={handleImageUpload}
          loading={loading}
          onCancel={handleCancel}
          submitButtonText="Create Recipe"
          loadingText="Creating Recipe..."
        />
      </div>
    </div>
  );
}
