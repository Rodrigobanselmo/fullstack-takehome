import { GraphQLError } from "graphql";

export const RecipeGroupNotFoundError = () =>
  new GraphQLError("Recipe group not found", {
    extensions: { code: "RECIPE_GROUP_NOT_FOUND" },
  });

