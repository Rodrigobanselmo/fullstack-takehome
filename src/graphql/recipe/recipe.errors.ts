import { GraphQLError } from "graphql";

export const RecipeNotFoundError = () =>
  new GraphQLError("Recipe not found", {
    extensions: {
      code: "RECIPE_NOT_FOUND",
    },
  });

