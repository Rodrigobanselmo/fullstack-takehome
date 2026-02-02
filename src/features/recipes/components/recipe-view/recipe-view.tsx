import type { RecipeTag, RecipeIngredient } from "generated/gql/graphql";
import { RECIPE_TAG_MAP } from "../../constants/recipe-tag-map";
import styles from "./recipe-view.module.css";

interface RecipeViewProps {
  name: string;
  servings: number;
  tags?: RecipeTag[];
  overallRating?: number | null;
  prepTimeMinutes?: number | null;
  ingredients: RecipeIngredient[];
}

export default function RecipeView({
  name,
  servings,
  tags = [],
  overallRating,
  prepTimeMinutes,
  ingredients,
}: RecipeViewProps) {
  return (
    <div className={styles.recipeView}>
      <div className={styles.header}>
        <h1 className={styles.title}>{name}</h1>
        {overallRating && (
          <div className={styles.rating}>{"⭐".repeat(overallRating)}</div>
        )}
      </div>

      <div className={styles.metadata}>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>🍽️</span>
          <span className={styles.metaLabel}>Servings:</span>
          <span className={styles.metaValue}>{servings}</span>
        </div>

        {prepTimeMinutes && (
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>⏱️</span>
            <span className={styles.metaLabel}>Prep Time:</span>
            <span className={styles.metaValue}>{prepTimeMinutes} min</span>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className={styles.tagsSection}>
          <h3 className={styles.sectionTitle}>Tags</h3>
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {RECIPE_TAG_MAP[tag]?.emoji} {RECIPE_TAG_MAP[tag]?.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.ingredientsSection}>
        <h3 className={styles.sectionTitle}>Ingredients</h3>
        <ul className={styles.ingredientsList}>
          {ingredients.map((ingredient) => (
            <li key={ingredient.id} className={styles.ingredientItem}>
              <span className={styles.ingredientQuantity}>
                {ingredient.quantity} {ingredient.unit}
              </span>
              <span className={styles.ingredientName}>
                {ingredient.ingredient.name}
              </span>
              {ingredient.notes && (
                <span className={styles.ingredientNotes}>
                  ({ingredient.notes})
                </span>
              )}
              {ingredient.optional && (
                <span className={styles.optionalBadge}>Optional</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
