import { gql } from "graphql-tag";

export const recipeTypeDefs = gql`
  scalar DateTime

  type RecipeIngredient {
    id: ID!
    name: String!
    quantity: Float!
    unit: String!
  }

  type Recipe {
    id: ID!
    name: String!
    servings: Int!
    ingredients: [RecipeIngredient!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input RecipeIngredientInput {
    name: String!
    quantity: Float!
    unit: String!
  }

  input CreateRecipeInput {
    name: String!
    servings: Int!
    ingredients: [RecipeIngredientInput!]!
  }

  input UpdateRecipeInput {
    name: String
    servings: Int
    ingredients: [RecipeIngredientInput!]
  }

  type PresignedPost {
    url: String!
    fields: String!
    key: String!
  }

  type UploadRecipeImageResult {
    file: File!
    presignedPost: PresignedPost!
  }

  input GeneratePresignedUrlInput {
    recipeId: ID!
    filename: String!
    mimeType: String!
  }

  type Query {
    recipes: [Recipe!]!
    recipe(id: ID!): Recipe
  }

  type Mutation {
    createRecipe(input: CreateRecipeInput!): Recipe!
    updateRecipe(id: ID!, input: UpdateRecipeInput!): Recipe!
    deleteRecipe(id: ID!): Boolean!
    uploadRecipeImage(input: GeneratePresignedUrlInput!): UploadRecipeImageResult!
    deleteRecipeImage(recipeId: ID!): Boolean!
  }
`;

