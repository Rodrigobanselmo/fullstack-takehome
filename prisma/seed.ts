import "dotenv/config";
import {
  AIMessageRole,
  Prisma,
  PrismaClient,
  UserRole,
} from "../generated/prisma/client";
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

  // Seed 100 empty threads for chat list infinite scroll testing
  console.log("Creating 50 empty threads for chat list testing...");
  const emptyThreadsBaseTime = new Date("2024-01-10T08:00:00Z");

  for (let i = 1; i <= 50; i++) {
    await prisma.ai_threads.upsert({
      where: { id: `seed-thread-${i}` },
      update: {},
      create: {
        id: `seed-thread-${i}`,
        title: `Thread ${i}`,
        userId: guestUser.id,
        createdAt: new Date(
          emptyThreadsBaseTime.getTime() + i * 3600000,
        ), // 1 hour apart
      },
    });
  }

  console.log("Created/updated 100 empty threads for chat list testing");

  // Seed AI Thread with 100 messages for infinite scroll testing
  const aiThread = await prisma.ai_threads.upsert({
    where: { id: "seed-thread-infinite-scroll" },
    update: {},
    create: {
      id: "seed-thread-infinite-scroll",
      title: "Recipe Planning & Ingredient Discussion",
      userId: guestUser.id,
    },
  });
  console.log(`Created/updated AI thread: ${aiThread.title}`);

  // Generate 100 messages simulating a realistic conversation
  const conversationTopics = [
    // Initial greeting and setup (messages 1-5)
    {
      user: "Hi! I'm planning meals for the week and need some help.",
      assistant:
        "Hello! I'd be happy to help you plan your meals for the week. What kind of recipes are you interested in? Do you have any dietary preferences or restrictions?",
    },
    {
      user: "I like Italian food and need something quick for weeknights.",
      assistant:
        "Great choice! Italian cuisine has many quick options. I see you have some recipes already like Pasta Pomodoro and Garlic Butter Pasta. Would you like suggestions for similar dishes, or are you looking for something different?",
    },
    {
      user: "What ingredients do I have available?",
      assistant:
        "Based on your inventory, you have:\n- Tomatoes (500g)\n- Onion (100g)\n- Garlic (multiple cloves)\n- Olive Oil\n- Spaghetti pasta\n- Fresh Basil\n- Parmesan Cheese\n- Chicken Breast\n- White Rice\n- Salt\n\nThese are perfect for several Italian dishes!",
    },
    // Recipe exploration (messages 6-15)
    {
      user: "Can you suggest a recipe using chicken?",
      assistant:
        "Absolutely! How about Chicken Piccata? It's a classic Italian dish that's ready in about 30 minutes. You'd need chicken breast, garlic, olive oil, and some fresh herbs. Would you like the full recipe?",
    },
    {
      user: "Yes, please share the recipe!",
      assistant:
        "**Chicken Piccata Recipe** (Serves 2)\n\nIngredients:\n- 400g chicken breast\n- 4 cloves garlic, minced\n- 60ml olive oil\n- Salt to taste\n- Fresh basil for garnish\n\nInstructions:\n1. Pound chicken to even thickness\n2. Season with salt\n3. Heat olive oil in a pan\n4. Cook chicken 5-6 min per side\n5. Add garlic in last 2 minutes\n6. Garnish with basil and serve!",
    },
    {
      user: "That sounds delicious! How many calories is that?",
      assistant:
        "For a serving of Chicken Piccata (about 200g of chicken with oil), you're looking at approximately 350-400 calories. The chicken breast is lean protein, and most calories come from the olive oil. Would you like me to suggest a lighter version?",
    },
    {
      user: "No, that's perfect. What should I serve it with?",
      assistant:
        "Chicken Piccata pairs wonderfully with:\n- White rice (you have this!)\n- Pasta with butter and garlic\n- Roasted vegetables\n- A simple salad with olive oil dressing\n\nSince you have rice and pasta, either would be authentic and delicious!",
    },
    {
      user: "Can I make this ahead of time?",
      assistant:
        "Chicken Piccata is best served fresh, but you can prep ahead:\n- Pound and season chicken up to 24h in advance\n- Mince garlic and store in fridge\n- Cook the full dish and refrigerate for up to 3 days\n- Reheat gently in a covered pan with a splash of water to keep it moist",
    },
    // Ingredient discussion (messages 16-30)
    {
      user: "Tell me more about the tomatoes I have.",
      assistant:
        "You have fresh red tomatoes in your inventory. They're categorized as vegetables and are priced at about R$5.00 per kg. Tomatoes are incredibly versatile - perfect for sauces, salads, or roasting. They're rich in lycopene, vitamin C, and add great flavor to Italian dishes!",
    },
    {
      user: "What's the best way to store fresh tomatoes?",
      assistant:
        "Great question! Here's how to store tomatoes:\n\n**Unripe tomatoes:** Room temperature, away from sunlight until they ripen\n**Ripe tomatoes:** Room temperature for 1-2 days for best flavor\n**Cut tomatoes:** Refrigerate in airtight container, use within 2 days\n\nTip: Never refrigerate whole tomatoes - it makes them mealy and reduces flavor!",
    },
    {
      user: "I want to make a tomato sauce from scratch.",
      assistant:
        "Excellent choice! Here's a basic tomato sauce recipe:\n\nIngredients:\n- 500g tomatoes (diced)\n- 4 cloves garlic (minced)\n- 60ml olive oil\n- Fresh basil\n- Salt to taste\n\nSteps:\n1. Heat olive oil, sauté garlic\n2. Add tomatoes, cook 15-20 min\n3. Season with salt\n4. Add torn basil leaves\n5. Simmer until thickened\n\nThis makes about 2 cups of sauce!",
    },
    {
      user: "How long does homemade tomato sauce last?",
      assistant:
        "Homemade tomato sauce storage:\n- **Refrigerator:** 5-7 days in an airtight container\n- **Freezer:** Up to 6 months in freezer bags or containers\n\nPro tip: Freeze in ice cube trays for easy portion control! Each cube is about 2 tablespoons - perfect for small recipes.",
    },
    {
      user: "What else can I do with tomatoes besides sauce?",
      assistant:
        "Tomatoes are so versatile! Here are some ideas:\n\n1. **Caprese Salad** - with mozzarella and basil\n2. **Bruschetta** - diced with garlic on toasted bread\n3. **Roasted Tomatoes** - slow-roasted with olive oil\n4. **Tomato Soup** - creamy and comforting\n5. **Fresh Salsa** - with onions and herbs\n6. **Stuffed Tomatoes** - hollowed and filled with rice\n7. **Sun-dried** - for concentrated flavor\n\nWhat sounds interesting to you?",
    },
    // Pasta discussions (messages 31-45)
    {
      user: "Let's talk about pasta. What types pair best with different sauces?",
      assistant:
        "Great question! Here's a guide:\n\n**Long pasta (spaghetti, linguine):**\n- Light olive oil sauces\n- Tomato-based sauces\n- Seafood sauces\n\n**Short pasta (penne, rigatoni):**\n- Chunky meat sauces\n- Cream-based sauces\n- Baked dishes\n\n**Filled pasta (ravioli, tortellini):**\n- Light butter sauces\n- Simple tomato sauce\n- Broth-based soups\n\nYou have spaghetti, which is perfect for your Pomodoro and Garlic Butter recipes!",
    },
    {
      user: "How much pasta should I cook per person?",
      assistant:
        "Standard pasta portions:\n\n**As a main course:**\n- 100-125g dry pasta per person\n- About 200-250g cooked pasta\n\n**As a side dish:**\n- 50-75g dry pasta per person\n- About 100-150g cooked pasta\n\nYour recipes call for 200g for 2 people (100g each) as a main, which is perfect! Pasta roughly doubles in weight when cooked.",
    },
    {
      user: "Why do you add salt to pasta water?",
      assistant:
        "Salt in pasta water serves important purposes:\n\n1. **Flavor:** It seasons the pasta from the inside out\n2. **Texture:** Helps strengthen the pasta's structure\n3. **Sauce adhesion:** Salted pasta holds sauce better\n\n**How much?** About 1-2 tablespoons per 4L of water. The water should taste like the sea! Don't worry - most salt stays in the water, not the pasta.",
    },
    {
      user: "Should I add oil to the pasta water?",
      assistant:
        "Actually, no! This is a common myth. Here's why:\n\n❌ **Don't add oil because:**\n- It prevents sauce from sticking to pasta\n- It's wasteful - oil just floats on top\n- It doesn't prevent sticking if you stir occasionally\n\n✅ **Instead:**\n- Use plenty of water (4L per 500g pasta)\n- Stir occasionally, especially in first 2 minutes\n- Save some pasta water for your sauce\n\nThe starch in pasta water helps sauce stick!",
    },
    {
      user: "What's the best way to tell when pasta is done?",
      assistant:
        "Perfect pasta timing:\n\n**Al Dente Test:**\n1. Start testing 2 minutes before package time\n2. Remove a piece and bite it\n3. Should be tender but firm in center\n4. Slight resistance when chewing\n\n**Visual Test:**\n- Cut a piece in half\n- No white/chalky center\n- Even color throughout\n\n**Pro tip:** If adding pasta to sauce, undercook by 1 minute - it'll finish cooking in the sauce!",
    },
    // Ingredient substitutions (messages 46-60)
    {
      user: "Can I substitute ingredients in recipes?",
      assistant:
        "Absolutely! Substitutions are common in cooking. Here are some guidelines:\n\n**When substituting:**\n- Consider the ingredient's role (flavor, texture, moisture)\n- Use similar ingredients (acid for acid, fat for fat)\n- Adjust quantities as needed\n- Taste and adjust seasoning\n\nWhat ingredient are you thinking of substituting?",
    },
    {
      user: "What can I use instead of Parmesan?",
      assistant:
        "Great question! Parmesan substitutes:\n\n**Similar flavor:**\n- Pecorino Romano (saltier, sharper)\n- Grana Padano (milder, similar texture)\n- Asiago (nutty, sharp)\n\n**Budget-friendly:**\n- Nutritional yeast (vegan, nutty)\n- Sharp cheddar (different but works)\n\n**In a pinch:**\n- Any hard, aged cheese you have\n\n**Ratio:** Usually 1:1, but taste as you go!",
    },
    {
      user: "What about substituting fresh basil?",
      assistant:
        "Basil alternatives depend on the dish:\n\n**Fresh herbs:**\n- Parsley (milder, works in most dishes)\n- Oregano (stronger, use less)\n- Thyme (earthy, use sparingly)\n\n**Dried basil:**\n- Use 1 teaspoon dried = 1 tablespoon fresh\n- Add earlier in cooking\n\n**Other options:**\n- Spinach for color in pesto\n- Arugula for peppery bite\n\nFresh basil is unique, but these work well!",
    },
    {
      user: "Can I use chicken thighs instead of breast?",
      assistant:
        "Yes! Chicken thighs are a great substitute:\n\n**Benefits:**\n- More flavorful\n- Harder to overcook\n- Juicier and more tender\n- Usually cheaper\n\n**Adjustments:**\n- Cook 2-3 minutes longer\n- Higher fat content (more calories)\n- Remove skin if you prefer leaner\n\n**Cooking temps:**\n- Breast: 165°F/74°C\n- Thighs: 175°F/80°C (can go higher)\n\nThighs are forgiving and delicious!",
    },
    {
      user: "What's a good substitute for olive oil?",
      assistant:
        "Olive oil substitutes depend on use:\n\n**For cooking:**\n- Vegetable oil (neutral flavor)\n- Canola oil (heart-healthy)\n- Avocado oil (high smoke point)\n- Butter (adds richness)\n\n**For dressings:**\n- Avocado oil (creamy)\n- Grapeseed oil (light)\n- Walnut oil (nutty)\n\n**Ratio:** 1:1 for most substitutions\n\nFor Italian dishes, olive oil's flavor is important, so extra virgin is worth it!",
    },
    // Meal prep and planning (messages 61-75)
    {
      user: "I want to meal prep for the week. Any tips?",
      assistant:
        "Excellent! Meal prep tips:\n\n**Planning:**\n- Choose 2-3 recipes that share ingredients\n- Pick dishes that store well (like your Chicken Rice)\n- Plan prep day (usually Sunday)\n\n**Cooking:**\n- Batch cook proteins\n- Pre-chop vegetables\n- Cook grains in large batches\n- Use multiple cooking methods (oven, stove, slow cooker)\n\n**Storage:**\n- Use airtight containers\n- Label with date and contents\n- Most meals last 4-5 days\n\nYour Simple Chicken and Rice is perfect for meal prep!",
    },
    {
      user: "How should I store meal prepped food?",
      assistant:
        "Meal prep storage best practices:\n\n**Containers:**\n- Glass (microwave safe, doesn't stain)\n- BPA-free plastic (lighter, cheaper)\n- Divided containers (keeps foods separate)\n\n**Refrigerator storage:**\n- Cool food before storing\n- Stack efficiently\n- Store within 2 hours of cooking\n- Use within 4-5 days\n\n**Freezer storage:**\n- Freeze individual portions\n- Remove air from bags\n- Label with date\n- Most meals last 2-3 months\n\n**Reheating:**\n- Microwave with lid slightly open\n- Add splash of water for moisture\n- Stir halfway through",
    },
    {
      user: "Which of my recipes freeze well?",
      assistant:
        "From your current recipes:\n\n✅ **Freezes well:**\n- **Pasta Pomodoro sauce** (freeze sauce separately, cook fresh pasta)\n- **Chicken and Rice** (separate components freeze better)\n\n❌ **Not ideal for freezing:**\n- **Garlic Butter Pasta** (pasta gets mushy, butter separates)\n\n**Freezing tips:**\n- Cool completely first\n- Use freezer bags or containers\n- Portion into single servings\n- Label with date and reheating instructions\n- Remove excess air\n\nFor pasta dishes, freeze sauce separately and cook pasta fresh!",
    },
    {
      user: "How do I prevent freezer burn?",
      assistant:
        "Preventing freezer burn:\n\n**Main causes:**\n- Air exposure\n- Temperature fluctuations\n- Long storage time\n\n**Prevention:**\n1. **Remove air:** Use vacuum sealer or squeeze air from bags\n2. **Wrap properly:** Double-wrap or use airtight containers\n3. **Quick freeze:** Spread items out initially\n4. **Maintain temp:** Keep freezer at 0°F/-18°C\n5. **Use within time:** 2-3 months for best quality\n6. **Label everything:** Track storage time\n\n**If food has freezer burn:**\n- Cut off affected areas\n- Still safe to eat, just dry and flavorless",
    },
    {
      user: "What's the best way to reheat pasta?",
      assistant:
        "Reheating pasta methods:\n\n**Stovetop (best method):**\n1. Heat pan over medium\n2. Add pasta with splash of water\n3. Stir frequently\n4. Heat until steaming\n\n**Microwave (quick):**\n1. Place in microwave-safe bowl\n2. Add 1-2 tablespoons water\n3. Cover with damp paper towel\n4. Heat 1-2 minutes, stir, repeat\n\n**Oven (for baked dishes):**\n1. Preheat to 350°F/175°C\n2. Cover with foil\n3. Heat 20-30 minutes\n\n**Pro tip:** Never reheat pasta more than once!",
    },
    // Cooking techniques (messages 76-90)
    {
      user: "What's the difference between sautéing and pan-frying?",
      assistant:
        "Great question! Both use a pan, but:\n\n**Sautéing:**\n- High heat\n- Small amount of fat\n- Quick cooking\n- Keep food moving\n- Example: garlic, vegetables\n\n**Pan-frying:**\n- Medium-high heat\n- More fat (covers bottom)\n- Longer cooking\n- Less movement\n- Example: chicken breast, fish\n\n**Key difference:** Amount of fat and food movement. Sauté = quick and active, pan-fry = slower and hands-off.",
    },
    {
      user: "How do I know when oil is hot enough?",
      assistant:
        "Testing oil temperature:\n\n**Visual cues:**\n- Shimmering surface\n- Slight ripples\n- Just before smoking\n\n**Practical tests:**\n1. **Wooden spoon test:** Dip handle in oil, bubbles form when ready\n2. **Breadcrumb test:** Drop a piece, should sizzle immediately\n3. **Water droplet:** Flick tiny drop, should sizzle (careful!)\n\n**Temperature guide:**\n- Sautéing: 350-375°F/175-190°C\n- Pan-frying: 350°F/175°C\n- Deep-frying: 375°F/190°C\n\n**Important:** If oil is smoking, it's too hot!",
    },
    {
      user: "Why does my garlic burn so easily?",
      assistant:
        "Garlic burns easily because:\n\n**Reasons:**\n- Small pieces = more surface area\n- Low moisture content\n- Burns at lower temp than onions\n- Goes from golden to burnt quickly\n\n**Prevention:**\n1. **Add later:** Cook onions first, garlic last\n2. **Lower heat:** Medium, not high\n3. **Bigger pieces:** Sliced burns less than minced\n4. **Watch closely:** Only 30-60 seconds needed\n5. **Wet environment:** Add with tomatoes/wine\n6. **Oil temp:** Add to warm, not hot oil\n\n**Burnt garlic?** Tastes bitter - start over!",
    },
    {
      user: "What's the best way to cook chicken breast without drying it out?",
      assistant:
        "Juicy chicken breast techniques:\n\n**Before cooking:**\n- Pound to even thickness\n- Brine (20 min in salt water)\n- Room temperature (not cold from fridge)\n\n**During cooking:**\n- Don't use high heat\n- Use meat thermometer (165°F/74°C)\n- Don't flip repeatedly\n- Add fat (oil/butter)\n\n**After cooking:**\n- **Rest for 5 minutes** (most important!)\n- Tent with foil\n- Juices redistribute\n\n**Method I recommend:**\nPan-sear 3 min/side, then finish in 375°F oven until 165°F internal temp.",
    },
    {
      user: "Should I wash chicken before cooking?",
      assistant:
        "**NO! Don't wash chicken.**\n\nHere's why:\n\n❌ **Risks of washing:**\n- Splashes bacteria (Salmonella, Campylobacter)\n- Contaminates sink, counters, nearby foods\n- Doesn't remove bacteria effectively\n- Increases cross-contamination risk\n\n✅ **Instead:**\n- Pat dry with paper towels\n- Throw towels away immediately\n- Cook to 165°F/74°C (kills bacteria)\n- Wash hands and surfaces after handling\n\n**USDA and FDA recommend against washing raw poultry!**",
    },
    // Recipe modification and creativity (messages 91-100)
    {
      user: "How can I make recipes healthier?",
      assistant:
        "Healthy recipe modifications:\n\n**Reduce fat:**\n- Use less oil (start with half)\n- Bake instead of fry\n- Remove chicken skin\n- Use cooking spray\n\n**Increase nutrition:**\n- Add vegetables\n- Use whole grain pasta\n- Include lean proteins\n- Add herbs instead of salt\n\n**Reduce calories:**\n- Smaller portions\n- More vegetables, less pasta\n- Use Greek yogurt for cream\n- Measure oil instead of pouring\n\nSmall changes make big differences!",
    },
    {
      user: "Can I add vegetables to my Garlic Butter Pasta?",
      assistant:
        "Absolutely! Vegetables are perfect additions:\n\n**Quick-cooking:**\n- Cherry tomatoes (halved)\n- Spinach (wilts in seconds)\n- Zucchini (thin slices)\n- Broccoli florets (blanch first)\n\n**When to add:**\n1. Hard vegetables: Cook before pasta\n2. Medium vegetables: Add with garlic\n3. Leafy greens: Toss at end\n\n**Suggested combo for your recipe:**\n- Cherry tomatoes + spinach\n- Sauté tomatoes with garlic\n- Add cooked pasta\n- Toss in fresh spinach\n- Finish with parmesan\n\nDelicious and nutritious!",
    },
    {
      user: "I want to make my own recipe. Where do I start?",
      assistant:
        "Creating your own recipe - exciting!\n\n**Start with:**\n1. **Base inspiration:** What flavors do you love?\n2. **Main ingredient:** Protein, pasta, or vegetable?\n3. **Cooking method:** Bake, sauté, roast?\n4. **Flavor profile:** Italian, Asian, Mexican?\n\n**Recipe structure:**\n- Protein or main component\n- Aromatics (garlic, onion)\n- Sauce or seasoning\n- Optional vegetables\n- Finishing touches\n\n**Testing:**\n- Start small (2 servings)\n- Take notes\n- Adjust seasoning\n- Write it down!\n\nWhat flavor profile interests you?",
    },
    {
      user: "I love Mediterranean flavors.",
      assistant:
        "Mediterranean cuisine is wonderful! Key elements:\n\n**Core ingredients:**\n- Olive oil (you have this!)\n- Garlic (check!)\n- Tomatoes (check!)\n- Fresh herbs (basil, oregano, parsley)\n- Lemon\n\n**Proteins:**\n- Chicken (you have!)\n- Fish\n- Chickpeas\n\n**Recipe idea for you:**\n**Mediterranean Chicken**\n- Pan-sear chicken\n- Make sauce: tomatoes, garlic, olives\n- Season with oregano\n- Serve over rice with lemon\n\nYou have most ingredients! Just need olives and lemon. Interested?",
    },
    {
      user: "That sounds perfect! Let me add olives to my shopping list.",
      assistant:
        "Great choice! When shopping for olives:\n\n**Types:**\n- Kalamata (Greek, purple, rich)\n- Green olives (firm, tangy)\n- Black olives (mild, soft)\n\n**For Mediterranean Chicken:** Kalamata olives are ideal!\n\n**Quantity:** 100-150g for 2 servings\n\n**Storage after opening:**\n- Keep in brine\n- Refrigerate\n- Lasts 1-2 weeks\n\n**Other uses:**\n- Pasta dishes\n- Salads\n- Pizza topping\n- Snacking\n\nWould you like the complete Mediterranean Chicken recipe?",
    },
    {
      user: "Yes please! And thank you for all the help today.",
      assistant:
        "You're very welcome! Here's your recipe:\n\n**Mediterranean Chicken** (Serves 2)\n\nIngredients:\n- 400g chicken breast\n- 300g tomatoes, diced\n- 100g Kalamata olives, pitted\n- 4 cloves garlic, minced\n- 60ml olive oil\n- 1 tsp dried oregano\n- Salt to taste\n- Fresh basil for garnish\n- Lemon wedges\n\nInstructions:\n1. Season and cook chicken (6-7 min/side), set aside\n2. In same pan, sauté garlic in olive oil\n3. Add tomatoes, cook 5 minutes\n4. Add olives and oregano\n5. Simmer 5 minutes\n6. Slice chicken, return to pan\n7. Garnish with basil, serve with lemon\n\nServe over your white rice. Enjoy! Feel free to ask anytime you need cooking help! 🍽️",
    },
    // Additional messages to reach 100 total (messages 101-122)
    {
      user: "One more question - how do I store fresh basil?",
      assistant:
        "Storing fresh basil:\n\n**Short-term (3-5 days):**\n- Trim stems\n- Place in glass with water (like flowers)\n- Cover loosely with plastic bag\n- Keep at room temperature\n- Change water daily\n\n**Longer storage (1 week):**\n- Wash and dry completely\n- Wrap in damp paper towel\n- Store in container or bag\n- Refrigerate\n\n**Freezing:**\n- Blend with olive oil\n- Freeze in ice cube trays\n- Use in cooking (not for garnish)\n\n**Never:** Don't refrigerate fresh basil leaves directly - they'll turn black!",
    },
    {
      user: "What's the difference between fresh and dried herbs in cooking?",
      assistant:
        "Fresh vs dried herbs:\n\n**Fresh herbs:**\n- Bright, vibrant flavor\n- Add at end of cooking\n- Better for garnish\n- Use 3x the amount vs dried\n- Examples: basil, cilantro, parsley\n\n**Dried herbs:**\n- Concentrated flavor\n- Add early in cooking\n- Better for long-cooked dishes\n- Use 1/3 the amount vs fresh\n- Examples: oregano, thyme, rosemary\n\n**Conversion:** 1 tbsp fresh = 1 tsp dried\n\n**Best dried:** Oregano, thyme, rosemary, bay leaves\n**Best fresh:** Basil, cilantro, parsley, dill",
    },
    {
      user: "Can I grow my own herbs?",
      assistant:
        "Absolutely! Growing herbs is easy and rewarding:\n\n**Easy herbs for beginners:**\n- Basil (needs warmth, lots of sun)\n- Parsley (tolerates shade)\n- Mint (grows like crazy!)\n- Chives (very hardy)\n\n**Basic needs:**\n- 6-8 hours sunlight daily\n- Well-draining soil\n- Regular watering\n- Container or garden bed\n\n**Kitchen herbs tips:**\n- Start with small pots on windowsill\n- Harvest regularly (encourages growth)\n- Pinch off flowers (extends leaf production)\n- Use fresh scissors for clean cuts\n\n**Benefit:** Fresh herbs whenever you cook!",
    },
    {
      user: "What kitchen tools are essential for a beginner?",
      assistant:
        "Essential kitchen tools for beginners:\n\n**Knives:**\n- Chef's knife (8-inch)\n- Paring knife\n- Cutting board (wood or plastic)\n\n**Cookware:**\n- Large skillet/frying pan\n- Medium saucepan with lid\n- Large pot for pasta/soup\n\n**Utensils:**\n- Wooden spoon\n- Spatula\n- Tongs\n- Measuring cups/spoons\n\n**Other:**\n- Mixing bowls\n- Colander\n- Vegetable peeler\n- Can opener\n\n**Nice to have:** Instant-read thermometer, box grater\n\nYou don't need expensive tools - focus on quality basics!",
    },
    {
      user: "How do I keep my knives sharp?",
      assistant:
        "Knife maintenance guide:\n\n**Regular maintenance:**\n- Honing steel (every 2-3 uses)\n- Straightens the edge\n- Doesn't remove metal\n- Quick swipes at 20° angle\n\n**Sharpening (every 3-6 months):**\n- Whetstone (best method)\n- Pull-through sharpener (easier)\n- Professional sharpening service\n- Removes metal to create new edge\n\n**Care tips:**\n- Hand wash only (never dishwasher)\n- Dry immediately\n- Store in knife block or on magnetic strip\n- Use wooden or plastic cutting boards\n- Never cut on glass, ceramic, or metal\n\n**Test sharpness:** Should easily slice paper or tomato skin",
    },
    {
      user: "What's the best way to organize my pantry?",
      assistant:
        "Pantry organization tips:\n\n**By category:**\n- Baking supplies together\n- Canned goods grouped\n- Pasta and grains section\n- Spices in one area\n- Snacks designated spot\n\n**Storage containers:**\n- Clear containers for dry goods\n- Label everything with name and date\n- Airtight for freshness\n- Square containers save space\n\n**Organization rules:**\n- Most-used items at eye level\n- Heavy items on lower shelves\n- First in, first out (rotate stock)\n- Check expiration dates monthly\n\n**Spice tips:**\n- Alphabetize for easy finding\n- Use small containers\n- Store away from heat and light",
    },
    {
      user: "How long do spices last?",
      assistant:
        "Spice shelf life:\n\n**Whole spices:** 3-4 years\n- Peppercorns\n- Whole cloves\n- Cinnamon sticks\n- Nutmeg\n\n**Ground spices:** 2-3 years\n- Most powdered spices\n- Garlic powder\n- Paprika\n- Curry powder\n\n**Dried herbs:** 1-3 years\n- Oregano\n- Basil\n- Thyme\n\n**Fresh ground:** 3-6 months\n- Pre-ground pepper\n\n**Testing freshness:**\n- Smell it - should be fragrant\n- Color should be vibrant\n- If weak smell, it's past prime\n\n**Storage:** Cool, dark, dry place - not above the stove!",
    },
    {
      user: "What's the difference between kosher salt and table salt?",
      assistant:
        "Salt types explained:\n\n**Table salt:**\n- Fine grains\n- Includes iodine and anti-caking agents\n- More concentrated\n- 1 tsp = 1 tsp\n\n**Kosher salt:**\n- Larger, flaky crystals\n- No additives\n- Easier to pinch and sprinkle\n- Less dense than table salt\n- Better for cooking\n\n**Conversion:**\n- 1 tsp table salt = 1.5 tsp kosher salt\n\n**Sea salt:**\n- Varies by source\n- Mineral flavor notes\n- Good for finishing\n\n**Best for cooking:** Kosher salt - easier to control seasoning\n**Best for baking:** Table salt - consistent measurements",
    },
    {
      user: "Can you explain what mise en place means?",
      assistant:
        "Mise en place - French for \"everything in its place\"\n\n**What it means:**\n- Prepare all ingredients before cooking\n- Measure everything\n- Chop all vegetables\n- Set up tools and equipment\n- Read recipe completely first\n\n**Benefits:**\n- Reduces stress\n- Prevents mistakes\n- Smoother cooking process\n- No scrambling mid-recipe\n- Professional kitchen standard\n\n**How to do it:**\n1. Read entire recipe\n2. Gather all ingredients\n3. Prep everything (chop, measure, etc.)\n4. Arrange in small bowls\n5. Start cooking\n\n**Result:** Cooking becomes enjoyable instead of chaotic! TV chefs always use mise en place.",
    },
    {
      user: "What should I do if I oversalt a dish?",
      assistant:
        "Fixing oversalted food:\n\n**For soups/stews:**\n- Add more liquid (water, broth)\n- Add potato chunks (absorb salt, remove before serving)\n- Add cream or coconut milk (dilutes)\n- Balance with acid (lemon, vinegar)\n\n**For sauces:**\n- Add unsalted butter\n- Mix in cream\n- Add a pinch of sugar\n- Dilute with unsalted liquid\n\n**For meat/vegetables:**\n- Serve with unsalted sides\n- Add acid (lemon juice)\n- Pair with starch (rice, bread)\n\n**For rice/pasta:**\n- Can't really fix these\n- Use as base for something bland\n- Mix with unsalted batch\n\n**Prevention:** Always taste before adding more salt!",
    },
    {
      user: "I'm intimidated by cooking fish. Any tips?",
      assistant:
        "Fish cooking made easy:\n\n**Choosing fish:**\n- Start with firm fish (salmon, cod, halibut)\n- Fresh smell (ocean, not fishy)\n- Firm, bright flesh\n- Ask fishmonger to prep it\n\n**Cooking methods:**\n\n**Pan-searing (easiest):**\n1. Pat fish dry\n2. Season with salt\n3. Hot pan, oil\n4. Skin side down first (if skin-on)\n5. Don't flip too early (3-4 min)\n6. Flip once, cook 2-3 min\n\n**Doneness test:**\n- Flakes easily with fork\n- Opaque throughout\n- 145°F/63°C internal temp\n\n**Common mistake:** Overcooking! Fish cooks fast.\n\n**Easy recipe:** Salmon with lemon, garlic, and olive oil - just like your chicken!",
    },
  ];

  // Create 100 messages with progressive timestamps
  const baseTime = new Date("2024-01-15T10:00:00Z");
  const messages = [];

  for (let i = 0; i < conversationTopics.length; i++) {
    const topic = conversationTopics[i];
    if (!topic) continue;

    // User message
    messages.push({
      id: `seed-msg-${i * 2 + 1}`,
      threadId: aiThread.id,
      role: AIMessageRole.user,
      content: topic.user,
      createdAt: new Date(baseTime.getTime() + i * 2 * 60000), // 2 minutes apart
    });

    // Assistant message
    messages.push({
      id: `seed-msg-${i * 2 + 2}`,
      threadId: aiThread.id,
      role: AIMessageRole.assistant,
      content: topic.assistant,
      createdAt: new Date(baseTime.getTime() + (i * 2 + 1) * 60000), // 1 minute after user
    });
  }

  // Create all messages
  for (const messageData of messages) {
    await prisma.ai_messages.upsert({
      where: { id: messageData.id },
      update: {},
      create: messageData,
    });
  }

  console.log(
    `Created/updated AI thread with ${messages.length} messages for infinite scroll testing`,
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
