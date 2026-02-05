import { DateTimeResolver } from "graphql-scalars";
import { GraphQLScalarType, Kind } from "graphql";
import { Prisma } from "generated/prisma";
import { aiResolvers } from "./ai/ai.resolvers";
import { authResolvers } from "./auth/auth.resolvers";
import { chatResolvers } from "./chat/chat.resolvers";
import { userResolvers } from "./user/user.resolvers";
import { recipeResolvers } from "./recipe/recipe.resolvers";
import { recipeGroupResolvers } from "./recipe-group/recipe-group.resolvers";
import { ingredientResolvers } from "./ingredient/ingredient.resolvers";

// Custom Decimal scalar for Prisma Decimal type
// parseValue returns a plain number so Zod validators work correctly
// Conversion to Prisma.Decimal happens at the repository layer
const DecimalScalar = new GraphQLScalarType({
  name: "Decimal",
  description: "Decimal custom scalar type",
  serialize(value: unknown) {
    if (value instanceof Prisma.Decimal) {
      return value.toNumber();
    }
    if (typeof value === "object" && value !== null && "toNumber" in value) {
      return (value as Prisma.Decimal).toNumber();
    }
    return value;
  },
  parseValue(value: unknown) {
    // Return plain number so Zod validators can validate it
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
      return parseFloat(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  DateTime: DateTimeResolver,
  Decimal: DecimalScalar,
  Recipe: recipeResolvers.Recipe,
  RecipeIngredient: recipeResolvers.RecipeIngredient,
  RecipeGroup: recipeGroupResolvers.RecipeGroup,
  Ingredient: ingredientResolvers.Ingredient,
  Mutation: {
    ...aiResolvers.Mutation,
    ...authResolvers.Mutation,
    ...chatResolvers.Mutation,
    ...recipeResolvers.Mutation,
    ...recipeGroupResolvers.Mutation,
    ...ingredientResolvers.Mutation,
  },
  Query: {
    ...aiResolvers.Query,
    ...userResolvers.Query,
    ...chatResolvers.Query,
    ...recipeResolvers.Query,
    ...recipeGroupResolvers.Query,
    ...ingredientResolvers.Query,
  },
};
