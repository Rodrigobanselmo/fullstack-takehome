import type { NextApiRequest } from "next";
import { getUserFromCookie, type UserSession } from "~/lib/auth";
import {
  createRecipesByGroupIdLoader,
  createIngredientsByRecipeIdLoader,
} from "~/server/dataloaders/recipe.dataloader";
import {
  createFileByRecipeIdLoader,
  createFileByRecipeGroupIdLoader,
} from "~/server/dataloaders/file.dataloader";
import { createUserByIdLoader } from "~/server/dataloaders/user.dataloader";

export interface GraphQLContext {
  req: NextApiRequest;
  user: UserSession | null;
  dataloaders: {
    recipesByGroupId: ReturnType<typeof createRecipesByGroupIdLoader>;
    ingredientsByRecipeId: ReturnType<typeof createIngredientsByRecipeIdLoader>;
    fileByRecipeId: ReturnType<typeof createFileByRecipeIdLoader>;
    fileByRecipeGroupId: ReturnType<typeof createFileByRecipeGroupIdLoader>;
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
      fileByRecipeId: createFileByRecipeIdLoader(),
      fileByRecipeGroupId: createFileByRecipeGroupIdLoader(),
      userById: createUserByIdLoader(),
    },
  };
}
