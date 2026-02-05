import { gql } from "graphql-tag";
import { aiTypeDefs } from "./ai/ai.schema";
import { authTypeDefs } from "./auth/auth.schema";
import { chatTypeDefs } from "./chat/chat.schema";
import { userTypeDefs } from "./user/user.schema";
import { recipeTypeDefs } from "./recipe/recipe.schema";
import { recipeGroupTypeDefs } from "./recipe-group/recipe-group.schema";
import { ingredientTypeDefs } from "./ingredient/ingredient.schema";
import { fileTypeDefs } from "./file/file.schema";

const baseTypeDefs = gql`
  scalar DateTime

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [
  baseTypeDefs,
  aiTypeDefs,
  authTypeDefs,
  chatTypeDefs,
  userTypeDefs,
  fileTypeDefs,
  recipeTypeDefs,
  recipeGroupTypeDefs,
  ingredientTypeDefs,
];
