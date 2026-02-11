import React from "react";
import styles from "./recipe-card.module.css";
import type { RecipeTag } from "generated/gql/graphql";
import { RECIPE_TAG_MAP } from "../../constants/recipe-tag-map";

interface RecipeCardProps {
  name: string;
  servings: number;
  tags?: RecipeTag[];
  overallRating?: number | null;
  prepTimeMinutes?: number | null;
  imageUrl?: string | null;
  onClick?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  name,
  servings,
  tags = [],
  overallRating,
  prepTimeMinutes,
  imageUrl,
  onClick,
}) => {
  return (
    <div className={styles.recipeCard} onClick={onClick}>
      {imageUrl && (
        <div className={styles.recipeImage}>
          <img src={imageUrl} alt={name} />
        </div>
      )}
      <div className={styles.recipeHeader}>
        <h3 className={styles.recipeTitle}>{name}</h3>
        {overallRating && (
          <div className={styles.rating}>{"⭐".repeat(overallRating)}</div>
        )}
      </div>

      <div className={styles.recipeDetails}>
        <div className={styles.recipeMeta}>
          <span className={styles.recipeMetaIcon}>🍽️</span>
          <span>{servings} servings</span>
        </div>

        {prepTimeMinutes && (
          <div className={styles.recipeMeta}>
            <span className={styles.recipeMetaIcon}>⏱️</span>
            <span>{prepTimeMinutes} min</span>
          </div>
        )}

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {RECIPE_TAG_MAP[tag]?.emoji} {RECIPE_TAG_MAP[tag]?.label}
              </span>
            ))}
            {tags.length > 3 && (
              <span className={styles.tagMore}>+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
