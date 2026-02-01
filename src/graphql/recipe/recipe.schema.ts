import { gql } from "graphql-tag";

export const recipeTypeDefs = gql`
  scalar DateTime

  enum RecipeTag {
    FAVORITE
    HEALTHY
    QUICK
    EASY
    CHEAP
    EXPENSIVE
    DELICIOUS
    COMFORT_FOOD
    VEGETARIAN
    VEGAN
    GLUTEN_FREE
    DAIRY_FREE
    LOW_CARB
    HIGH_PROTEIN
    SPICY
    SWEET
    SAVORY
    BREAKFAST
    LUNCH
    DINNER
    SNACK
    DESSERT
    PARTY
    KIDS_FRIENDLY
    MEAL_PREP
  }

  type RecipeIngredient {
    id: ID!
    ingredientId: ID!
    ingredient: Ingredient!
    quantity: Float!
    unit: String!
    notes: String
    optional: Boolean!
  }

  type Recipe {
    id: ID!
    name: String!
    servings: Int!
    tags: [RecipeTag!]!
    overallRating: Int
    prepTimeMinutes: Int
    ingredients: [RecipeIngredient!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input RecipeIngredientInput {
    ingredientId: ID!
    quantity: Float!
    unit: String!
    notes: String
    optional: Boolean
  }

  input CreateRecipeInput {
    name: String!
    servings: Int!
    tags: [RecipeTag!]
    overallRating: Int
    prepTimeMinutes: Int
    ingredients: [RecipeIngredientInput!]!
  }

  input UpdateRecipeInput {
    name: String
    servings: Int
    tags: [RecipeTag!]
    overallRating: Int
    prepTimeMinutes: Int
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

