import { GraphQLError } from "graphql";

export const IngredientNotFoundError = () =>
  new GraphQLError("Ingredient not found", {
    extensions: {
      code: "INGREDIENT_NOT_FOUND",
    },
  });

export const IngredientAlreadyExistsError = () =>
  new GraphQLError("Ingredient with this name already exists", {
    extensions: {
      code: "INGREDIENT_ALREADY_EXISTS",
    },
  });

