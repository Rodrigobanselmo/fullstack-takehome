import type { Recipe } from "generated/gql/graphql";
import styles from "./recipe-group-view.module.css";

interface RecipeGroupViewProps {
  name: string;
  description?: string | null;
  recipes: Recipe[];
}

export default function RecipeGroupView({
  name,
  description,
  recipes,
}: RecipeGroupViewProps) {
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
            {recipes.map((recipe) => (
              <li key={recipe.id} className={styles.recipeItem}>
                <span className={styles.recipeName}>{recipe.name}</span>
                <div className={styles.recipeDetails}>
                  <span className={styles.recipeDetail}>
                    🍽️ {recipe.servings} servings
                  </span>
                  {recipe.prepTimeMinutes && (
                    <span className={styles.recipeDetail}>
                      ⏱️ {recipe.prepTimeMinutes} min
                    </span>
                  )}
                  {recipe.overallRating && (
                    <span className={styles.recipeDetail}>
                      {"⭐".repeat(recipe.overallRating)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>No recipes in this group yet.</p>
        )}
      </div>
    </div>
  );
}
