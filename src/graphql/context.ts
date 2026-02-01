import type { NextApiRequest } from "next";
import { getUserFromCookie, type UserSession } from "~/lib/auth";
import {
  createRecipesByGroupIdLoader,
  createIngredientsByRecipeIdLoader,
} from "~/server/dataloaders/recipe.dataloader";
import {
  createFileByRecipeIdLoader,
  createFileByRecipeGroupIdLoader,
  createFileByIngredientIdLoader,
} from "~/server/dataloaders/file.dataloader";
import { createUserByIdLoader } from "~/server/dataloaders/user.dataloader";
import { createIngredientByIdLoader } from "~/server/dataloaders/ingredient.dataloader";

export interface GraphQLContext {
  req: NextApiRequest;
  user: UserSession | null;
  dataloaders: {
    recipesByGroupId: ReturnType<typeof createRecipesByGroupIdLoader>;
    ingredientsByRecipeId: ReturnType<typeof createIngredientsByRecipeIdLoader>;
    ingredientById: ReturnType<typeof createIngredientByIdLoader>;
    fileByRecipeId: ReturnType<typeof createFileByRecipeIdLoader>;
    fileByRecipeGroupId: ReturnType<typeof createFileByRecipeGroupIdLoader>;
    fileByIngredientId: ReturnType<typeof createFileByIngredientIdLoader>;
    userById: ReturnType<typeof createUserByIdLoader>;
  };
}

export async function createContext(
  req: NextApiRequest,
): Promise<GraphQLContext> {
  const user = await getUserFromCookie();

  return {
    req,
    user,
    dataloaders: {
      recipesByGroupId: createRecipesByGroupIdLoader(),
      ingredientsByRecipeId: createIngredientsByRecipeIdLoader(),
      ingredientById: createIngredientByIdLoader(),
      fileByRecipeId: createFileByRecipeIdLoader(),
      fileByRecipeGroupId: createFileByRecipeGroupIdLoader(),
      fileByIngredientId: createFileByIngredientIdLoader(),
      userById: createUserByIdLoader(),
    },
  };
}
