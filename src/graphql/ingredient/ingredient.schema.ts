import { gql } from "graphql-tag";

export const ingredientTypeDefs = gql`
  scalar DateTime
  scalar Decimal

  enum IngredientCategory {
    VEGETABLES
    FRUITS
    GRAINS
    PROTEINS
    DAIRY
    OILS_FATS
    SPICES_HERBS
    CONDIMENTS
    BAKING
    BEVERAGES
    SNACKS
    FROZEN
    CANNED
    PASTA_NOODLES
    NUTS_SEEDS
    SWEETENERS
    OTHER
  }

  type Ingredient {
    id: ID!
    name: String!
    description: String
    category: IngredientCategory
    defaultUnit: String
    averagePrice: Decimal
    priceUnit: String
    priceCurrency: String
    userId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    image: File
  }

  input CreateIngredientInput {
    name: String!
    description: String
    category: IngredientCategory
    defaultUnit: String
    averagePrice: Decimal
    priceUnit: String
    priceCurrency: String
  }

  input UpdateIngredientInput {
    name: String
    description: String
    category: IngredientCategory
    defaultUnit: String
    averagePrice: Decimal
    priceUnit: String
    priceCurrency: String
  }

  input GenerateIngredientPresignedUrlInput {
    ingredientId: ID!
    filename: String!
    mimeType: String!
  }

  type UploadIngredientImageResult {
    file: File!
    presignedPost: PresignedPost!
  }

  type Query {
    ingredients: [Ingredient!]!
    ingredient(id: ID!): Ingredient
  }

  type Mutation {
    createIngredient(input: CreateIngredientInput!): Ingredient!
    updateIngredient(id: ID!, input: UpdateIngredientInput!): Ingredient!
    deleteIngredient(id: ID!): Boolean!
    uploadIngredientImage(input: GenerateIngredientPresignedUrlInput!): UploadIngredientImageResult!
    deleteIngredientImage(ingredientId: ID!): Boolean!
  }
`;

