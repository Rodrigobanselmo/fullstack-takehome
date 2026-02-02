import { gql } from "graphql-tag";

export const recipeGroupTypeDefs = gql`
  type RecipeGroup {
    id: ID!
    name: String!
    description: String
    recipes: [Recipe!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateRecipeGroupInput {
    name: String!
    description: String
    recipeIds: [ID!]
  }

  input UpdateRecipeGroupInput {
    name: String
    description: String
  }

  input AddRecipesToGroupInput {
    groupId: ID!
    recipeIds: [ID!]!
  }

  input RemoveRecipesFromGroupInput {
    groupId: ID!
    recipeIds: [ID!]!
  }

  type UploadRecipeGroupImageResult {
    file: File!
    presignedPost: PresignedPost!
  }

  input GenerateRecipeGroupPresignedUrlInput {
    groupId: ID!
    filename: String!
    mimeType: String!
  }

  type Query {
    recipeGroups: [RecipeGroup!]!
    recipeGroup(id: ID!): RecipeGroup
  }

  type Mutation {
    createRecipeGroup(input: CreateRecipeGroupInput!): RecipeGroup!
    updateRecipeGroup(id: ID!, input: UpdateRecipeGroupInput!): RecipeGroup!
    deleteRecipeGroup(id: ID!): ID!
    addRecipesToGroup(input: AddRecipesToGroupInput!): RecipeGroup!
    removeRecipesFromGroup(input: RemoveRecipesFromGroupInput!): RecipeGroup!
    uploadRecipeGroupImage(
      input: GenerateRecipeGroupPresignedUrlInput!
    ): UploadRecipeGroupImageResult!
    deleteRecipeGroupImage(groupId: ID!): Boolean!
  }
`;
