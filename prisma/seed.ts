import "dotenv/config";
import { Prisma, PrismaClient, UserRole } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log(`Start seeding ...`);

  const saltRounds = 10;
  const guestPassword = "guest";
  const hashedPassword = await bcrypt.hash(guestPassword, saltRounds);

  // Create guest user
  const guestUser = await prisma.users.upsert({
    where: { username: "guest" },
    update: {},
    create: {
      username: "guest",
      password: hashedPassword,
      role: UserRole.contractor,
      name: "Guest User",
    },
  });

  console.log(
    `Created/updated guest user: ${guestUser.username} with ID: ${guestUser.id}`,
  );

  // Seed Ingredients
  const ingredientsData = [
    {
      id: "seed-ingredient-tomato",
      name: "Tomato",
      description: "Fresh red tomatoes",
      categories: ["VEGETABLES"],
      defaultUnit: "g",
      averagePrice: new Prisma.Decimal(5.0),
      priceUnit: "kg",
    },
    {
      id: "seed-ingredient-onion",
      name: "Onion",
      description: "Yellow onion",
      categories: ["VEGETABLES"],
      defaultUnit: "g",
      averagePrice: new Prisma.Decimal(3.0),
      priceUnit: "kg",
    },
    {
      id: "seed-ingredient-garlic",
      name: "Garlic",
      description: "Fresh garlic cloves",
      categories: ["VEGETABLES"],
      defaultUnit: "cloves",
      averagePrice: new Prisma.Decimal(15.0),
      priceUnit: "kg",
    },
    {
      id: "seed-ingredient-olive-oil",
      name: "Olive Oil",
      description: "Extra virgin olive oil",
      categories: ["OILS_FATS"],
      defaultUnit: "ml",
      averagePrice: new Prisma.Decimal(40.0),
      priceUnit: "liter",
    },
    {
      id: "seed-ingredient-pasta",
      name: "Spaghetti",
      description: "Italian spaghetti pasta",
      categories: ["PASTA_NOODLES"],
      defaultUnit: "g",
      averagePrice: new Prisma.Decimal(8.0),
      priceUnit: "kg",
    },
    {
      id: "seed-ingredient-basil",
      name: "Fresh Basil",
      description: "Fresh basil leaves",
      categories: ["SPICES_HERBS"],
      defaultUnit: "leaves",
      averagePrice: new Prisma.Decimal(2.0),
      priceUnit: "bunch",
    },
    {
      id: "seed-ingredient-parmesan",
      name: "Parmesan Cheese",
      description: "Aged parmesan cheese",
      categories: ["DAIRY"],
      defaultUnit: "g",
      averagePrice: new Prisma.Decimal(80.0),
      priceUnit: "kg",
    },
    {
      id: "seed-ingredient-chicken",
      name: "Chicken Breast",
      description: "Boneless skinless chicken breast",
      categories: ["PROTEINS"],
      defaultUnit: "g",
      averagePrice: new Prisma.Decimal(25.0),
      priceUnit: "kg",
    },
    {
      id: "seed-ingredient-rice",
      name: "White Rice",
      description: "Long grain white rice",
      categories: ["GRAINS"],
      defaultUnit: "g",
      averagePrice: new Prisma.Decimal(6.0),
      priceUnit: "kg",
    },
    {
      id: "seed-ingredient-salt",
      name: "Salt",
      description: "Fine table salt",
      categories: ["SPICES_HERBS"],
      defaultUnit: "g",
      averagePrice: new Prisma.Decimal(2.0),
      priceUnit: "kg",
    },
  ];

  const createdIngredients: Record<string, { id: string; name: string }> = {};
  for (const ingredientData of ingredientsData) {
    const ingredient = await prisma.ingredients.upsert({
      where: {
        ingredients_name_user_unique: {
          name: ingredientData.name,
          userId: guestUser.id,
        },
      },
      update: {},
      create: {
        ...ingredientData,
        userId: guestUser.id,
      },
    });
    createdIngredients[ingredientData.id] = ingredient;
    console.log(`Created/updated ingredient: ${ingredient.name}`);
  }

  // Seed Recipes
  const recipesData = [
    {
      id: "seed-recipe-pasta-pomodoro",
      name: "Pasta Pomodoro",
      servings: 4,
      tags: ["EASY", "QUICK", "VEGETARIAN", "DINNER"],
      overallRating: 5,
      prepTimeMinutes: 30,
      instructions: `## Pasta Pomodoro

### Instructions
1. Bring a large pot of salted water to boil
2. Cook spaghetti according to package directions
3. Meanwhile, heat olive oil in a large pan
4. Add minced garlic and cook until fragrant
5. Add diced tomatoes and cook for 10 minutes
6. Season with salt and fresh basil
7. Toss pasta with sauce and serve with parmesan`,
    },
    {
      id: "seed-recipe-chicken-rice",
      name: "Simple Chicken and Rice",
      servings: 2,
      tags: ["EASY", "HEALTHY", "HIGH_PROTEIN", "DINNER", "MEAL_PREP"],
      overallRating: 4,
      prepTimeMinutes: 45,
      instructions: `## Simple Chicken and Rice

### Instructions
1. Season chicken breast with salt
2. Cook rice according to package directions
3. Heat olive oil in a pan over medium-high heat
4. Cook chicken for 6-7 minutes per side until done
5. Let chicken rest for 5 minutes, then slice
6. Serve chicken over rice with sautéed onions`,
    },
    {
      id: "seed-recipe-garlic-pasta",
      name: "Garlic Butter Pasta",
      servings: 2,
      tags: ["QUICK", "EASY", "VEGETARIAN", "COMFORT_FOOD"],
      overallRating: 4,
      prepTimeMinutes: 20,
      instructions: `## Garlic Butter Pasta

### Instructions
1. Cook pasta in salted boiling water
2. In a pan, heat olive oil and add minced garlic
3. Cook garlic until golden (don't burn!)
4. Toss drained pasta with garlic oil
5. Top with parmesan and fresh basil`,
    },
  ];

  const createdRecipes: Record<string, { id: string; name: string }> = {};
  for (const recipeData of recipesData) {
    const recipe = await prisma.recipes.upsert({
      where: { id: recipeData.id },
      update: {},
      create: {
        ...recipeData,
        userId: guestUser.id,
      },
    });
    createdRecipes[recipe.id] = recipe;
    console.log(`Created/updated recipe: ${recipe.name}`);
  }

  // Seed Recipe Ingredients (linking recipes to ingredients)
  const recipeIngredientsData = [
    // Pasta Pomodoro ingredients
    {
      id: "seed-ri-pasta-pomodoro-1",
      recipeId: "seed-recipe-pasta-pomodoro",
      ingredientId: "seed-ingredient-pasta",
      quantity: new Prisma.Decimal(400),
      unit: "g",
    },
    {
      id: "seed-ri-pasta-pomodoro-2",
      recipeId: "seed-recipe-pasta-pomodoro",
      ingredientId: "seed-ingredient-tomato",
      quantity: new Prisma.Decimal(500),
      unit: "g",
      notes: "diced",
    },
    {
      id: "seed-ri-pasta-pomodoro-3",
      recipeId: "seed-recipe-pasta-pomodoro",
      ingredientId: "seed-ingredient-garlic",
      quantity: new Prisma.Decimal(4),
      unit: "cloves",
      notes: "minced",
    },
    {
      id: "seed-ri-pasta-pomodoro-4",
      recipeId: "seed-recipe-pasta-pomodoro",
      ingredientId: "seed-ingredient-olive-oil",
      quantity: new Prisma.Decimal(60),
      unit: "ml",
    },
    {
      id: "seed-ri-pasta-pomodoro-5",
      recipeId: "seed-recipe-pasta-pomodoro",
      ingredientId: "seed-ingredient-basil",
      quantity: new Prisma.Decimal(10),
      unit: "leaves",
    },
    {
      id: "seed-ri-pasta-pomodoro-6",
      recipeId: "seed-recipe-pasta-pomodoro",
      ingredientId: "seed-ingredient-parmesan",
      quantity: new Prisma.Decimal(50),
      unit: "g",
      notes: "grated",
      optional: true,
    },
    {
      id: "seed-ri-pasta-pomodoro-7",
      recipeId: "seed-recipe-pasta-pomodoro",
      ingredientId: "seed-ingredient-salt",
      quantity: new Prisma.Decimal(5),
      unit: "g",
    },
    // Chicken and Rice ingredients
    {
      id: "seed-ri-chicken-rice-1",
      recipeId: "seed-recipe-chicken-rice",
      ingredientId: "seed-ingredient-chicken",
      quantity: new Prisma.Decimal(400),
      unit: "g",
    },
    {
      id: "seed-ri-chicken-rice-2",
      recipeId: "seed-recipe-chicken-rice",
      ingredientId: "seed-ingredient-rice",
      quantity: new Prisma.Decimal(200),
      unit: "g",
    },
    {
      id: "seed-ri-chicken-rice-3",
      recipeId: "seed-recipe-chicken-rice",
      ingredientId: "seed-ingredient-onion",
      quantity: new Prisma.Decimal(100),
      unit: "g",
      notes: "sliced",
    },
    {
      id: "seed-ri-chicken-rice-4",
      recipeId: "seed-recipe-chicken-rice",
      ingredientId: "seed-ingredient-olive-oil",
      quantity: new Prisma.Decimal(30),
      unit: "ml",
    },
    {
      id: "seed-ri-chicken-rice-5",
      recipeId: "seed-recipe-chicken-rice",
      ingredientId: "seed-ingredient-salt",
      quantity: new Prisma.Decimal(3),
      unit: "g",
    },
    // Garlic Butter Pasta ingredients
    {
      id: "seed-ri-garlic-pasta-1",
      recipeId: "seed-recipe-garlic-pasta",
      ingredientId: "seed-ingredient-pasta",
      quantity: new Prisma.Decimal(200),
      unit: "g",
    },
    {
      id: "seed-ri-garlic-pasta-2",
      recipeId: "seed-recipe-garlic-pasta",
      ingredientId: "seed-ingredient-garlic",
      quantity: new Prisma.Decimal(6),
      unit: "cloves",
      notes: "thinly sliced",
    },
    {
      id: "seed-ri-garlic-pasta-3",
      recipeId: "seed-recipe-garlic-pasta",
      ingredientId: "seed-ingredient-olive-oil",
      quantity: new Prisma.Decimal(80),
      unit: "ml",
    },
    {
      id: "seed-ri-garlic-pasta-4",
      recipeId: "seed-recipe-garlic-pasta",
      ingredientId: "seed-ingredient-parmesan",
      quantity: new Prisma.Decimal(30),
      unit: "g",
      notes: "grated",
    },
    {
      id: "seed-ri-garlic-pasta-5",
      recipeId: "seed-recipe-garlic-pasta",
      ingredientId: "seed-ingredient-basil",
      quantity: new Prisma.Decimal(5),
      unit: "leaves",
      optional: true,
    },
    {
      id: "seed-ri-garlic-pasta-6",
      recipeId: "seed-recipe-garlic-pasta",
      ingredientId: "seed-ingredient-salt",
      quantity: new Prisma.Decimal(2),
      unit: "g",
    },
  ];

  for (const riData of recipeIngredientsData) {
    // Get actual IDs from the created records (in case they already existed with different IDs)
    const actualRecipeId =
      createdRecipes[riData.recipeId]?.id ?? riData.recipeId;
    const actualIngredientId =
      createdIngredients[riData.ingredientId]?.id ?? riData.ingredientId;

    const { recipeId: _r, ingredientId: _i, ...restData } = riData;

    await prisma.recipe_ingredients.upsert({
      where: { id: riData.id },
      update: {},
      create: {
        ...restData,
        recipeId: actualRecipeId,
        ingredientId: actualIngredientId,
      },
    });
  }
  console.log(
    `Created/updated ${recipeIngredientsData.length} recipe ingredients`,
  );

  // Seed Recipe Groups
  const recipeGroupsData = [
    {
      id: "seed-group-italian",
      name: "Italian Favorites",
      description: "Classic Italian recipes",
    },
    {
      id: "seed-group-quick-meals",
      name: "Quick Weeknight Meals",
      description: "Recipes ready in 30 minutes or less",
    },
    {
      id: "seed-group-meal-prep",
      name: "Meal Prep Ideas",
      description: "Great recipes for weekly meal prep",
    },
  ];

  const createdGroups: Record<string, { id: string; name: string }> = {};
  for (const groupData of recipeGroupsData) {
    const group = await prisma.recipe_groups.upsert({
      where: { id: groupData.id },
      update: {},
      create: {
        ...groupData,
        userId: guestUser.id,
      },
    });
    createdGroups[group.id] = group;
    console.log(`Created/updated recipe group: ${group.name}`);
  }

  // Link recipes to groups
  const recipeGroupRecipesData = [
    // Italian Favorites
    {
      id: "seed-rgr-italian-1",
      groupId: "seed-group-italian",
      recipeId: "seed-recipe-pasta-pomodoro",
    },
    {
      id: "seed-rgr-italian-2",
      groupId: "seed-group-italian",
      recipeId: "seed-recipe-garlic-pasta",
    },
    // Quick Weeknight Meals
    {
      id: "seed-rgr-quick-1",
      groupId: "seed-group-quick-meals",
      recipeId: "seed-recipe-garlic-pasta",
    },
    {
      id: "seed-rgr-quick-2",
      groupId: "seed-group-quick-meals",
      recipeId: "seed-recipe-pasta-pomodoro",
    },
    // Meal Prep Ideas
    {
      id: "seed-rgr-mealprep-1",
      groupId: "seed-group-meal-prep",
      recipeId: "seed-recipe-chicken-rice",
    },
  ];

  for (const rgrData of recipeGroupRecipesData) {
    // Get actual IDs from the created records
    const actualRecipeId =
      createdRecipes[rgrData.recipeId]?.id ?? rgrData.recipeId;
    const actualGroupId = createdGroups[rgrData.groupId]?.id ?? rgrData.groupId;

    await prisma.recipe_group_recipes.upsert({
      where: {
        recipeId_groupId: {
          recipeId: actualRecipeId,
          groupId: actualGroupId,
        },
      },
      update: {},
      create: {
        id: rgrData.id,
        recipeId: actualRecipeId,
        groupId: actualGroupId,
      },
    });
  }
  console.log(
    `Created/updated ${recipeGroupRecipesData.length} recipe-group links`,
  );

  console.log(`Seeding finished.`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
