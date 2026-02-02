import React from "react";
import styles from "./recipe-group-card.module.css";

interface RecipeGroupCardProps {
  name: string;
  description?: string | null;
  recipeCount?: number;
  onClick?: () => void;
}

const RecipeGroupCard: React.FC<RecipeGroupCardProps> = ({
  name,
  description,
  recipeCount = 0,
  onClick,
}) => {
  return (
    <div className={styles.recipeGroupCard} onClick={onClick}>
      <div className={styles.recipeGroupHeader}>
        <h3 className={styles.recipeGroupTitle}>{name}</h3>
      </div>

      {description && (
        <p className={styles.recipeGroupDescription}>{description}</p>
      )}

      <div className={styles.recipeGroupFooter}>
        <div className={styles.recipeGroupMeta}>
          <span className={styles.recipeGroupMetaIcon}>📚</span>
          <span>
            {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecipeGroupCard;
