import { GraphQLError } from "graphql";

export const RecipeGroupNotFoundError = () =>
  new GraphQLError("Recipe group not found", {
    extensions: { code: "RECIPE_GROUP_NOT_FOUND" },
  });

export const RecipeRequiresGroupError = (recipeNames: string[]) =>
  new GraphQLError(
    `Cannot remove recipe(s) from their only group: ${recipeNames.join(", ")}. Recipes must belong to at least one group.`,
    {
      extensions: { code: "RECIPE_REQUIRES_GROUP" },
    }
  );
