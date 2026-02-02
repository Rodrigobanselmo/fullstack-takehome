import React from "react";
import styles from "./ingredient-card.module.css";
import type { IngredientCategory } from "generated/gql/graphql";
import { INGREDIENT_CATEGORY_MAP } from "../../constants/ingredient-category-map";

interface IngredientCardProps {
  name: string;
  description?: string | null;
  category?: IngredientCategory | null;
  defaultUnit?: string | null;
  averagePrice?: number | null;
  priceUnit?: string | null;
  priceCurrency?: string | null;
  onClick?: () => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({
  name,
  description,
  category,
  defaultUnit,
  averagePrice,
  priceUnit,
  priceCurrency,
  onClick,
}) => {
  return (
    <div className={styles.ingredientCard} onClick={onClick}>
      <div className={styles.ingredientHeader}>
        <h3 className={styles.ingredientTitle}>{name}</h3>
        {category && (
          <span className={styles.category}>
            {INGREDIENT_CATEGORY_MAP[category]?.emoji}
          </span>
        )}
      </div>

      {description && (
        <p className={styles.ingredientDescription}>{description}</p>
      )}

      <div className={styles.ingredientDetails}>
        {defaultUnit && (
          <div className={styles.ingredientMeta}>
            <span className={styles.ingredientMetaIcon}>📏</span>
            <span>{defaultUnit}</span>
          </div>
        )}

        {averagePrice && (
          <div className={styles.ingredientMeta}>
            <span className={styles.ingredientMetaIcon}>💰</span>
            <span>
              {priceCurrency || "$"}
              {averagePrice.toFixed(2)}
              {priceUnit && ` / ${priceUnit}`}
            </span>
          </div>
        )}

        {category && (
          <div className={styles.categoryBadge}>
            {INGREDIENT_CATEGORY_MAP[category]?.emoji}{" "}
            {INGREDIENT_CATEGORY_MAP[category]?.label}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientCard;
