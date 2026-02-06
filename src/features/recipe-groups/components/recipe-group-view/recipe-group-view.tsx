import { gql } from "@apollo/client";
import type { FragmentType } from "generated/gql/fragment-masking";
import { useFragment } from "generated/gql/fragment-masking";
import {
  RecipeGroupViewFragmentDoc,
  RecipeGroupViewRecipeFragmentDoc,
} from "generated/gql/graphql";
import styles from "./recipe-group-view.module.css";

export const RECIPE_GROUP_VIEW_RECIPE_FRAGMENT = gql`
  fragment RecipeGroupViewRecipe on Recipe {
    id
    name
    servings
    prepTimeMinutes
    overallRating
  }
`;

export const RECIPE_GROUP_VIEW_FRAGMENT = gql`
  fragment RecipeGroupView on RecipeGroup {
    id
    name
    description
    recipes {
      ...RecipeGroupViewRecipe
    }
    createdAt
    updatedAt
  }
  ${RECIPE_GROUP_VIEW_RECIPE_FRAGMENT}
`;

interface RecipeGroupViewProps {
  recipeGroup: FragmentType<typeof RecipeGroupViewFragmentDoc>;
}

interface RecipeItemProps {
  recipe: FragmentType<typeof RecipeGroupViewRecipeFragmentDoc>;
}

function RecipeItem({ recipe }: RecipeItemProps) {
  const data = useFragment(RecipeGroupViewRecipeFragmentDoc, recipe);

  return (
    <li className={styles.recipeItem}>
      <span className={styles.recipeName}>{data.name}</span>
      <div className={styles.recipeDetails}>
        <span className={styles.recipeDetail}>🍽️ {data.servings} servings</span>
        {data.prepTimeMinutes && (
          <span className={styles.recipeDetail}>
            ⏱️ {data.prepTimeMinutes} min
          </span>
        )}
        {data.overallRating && (
          <span className={styles.recipeDetail}>
            {"⭐".repeat(data.overallRating)}
          </span>
        )}
      </div>
    </li>
  );
}

export default function RecipeGroupView({ recipeGroup }: RecipeGroupViewProps) {
  const { name, description, recipes } = useFragment(
    RecipeGroupViewFragmentDoc,
    recipeGroup,
  );

  return (
    <div className={styles.recipeGroupView}>
      <div className={styles.header}>
        <h1 className={styles.title}>{name}</h1>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.recipesSection}>
        <h3 className={styles.sectionTitle}>Recipes ({recipes.length})</h3>
        {recipes.length > 0 ? (
          <ul className={styles.recipesList}>
            {recipes.map((recipe, index) => (
              <RecipeItem key={index} recipe={recipe} />
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>No recipes in this group yet.</p>
        )}
      </div>
    </div>
  );
}
