import React from "react";
import styles from "./ingredient-card.module.css";
import type { IngredientCategory } from "generated/gql/graphql";
import { INGREDIENT_CATEGORY_MAP } from "../../constants/ingredient-category-map";

interface IngredientCardProps {
  name: string;
  description?: string | null;
  categories?: IngredientCategory[] | null;
  defaultUnit?: string | null;
  averagePrice?: number | null;
  priceUnit?: string | null;
  priceCurrency?: string | null;
  isSystem?: boolean;
  onClick?: () => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({
  name,
  description,
  categories,
  defaultUnit,
  averagePrice,
  priceUnit,
  priceCurrency,
  isSystem,
  onClick,
}) => {
  const firstCategory = categories?.[0];

  return (
    <div className={styles.ingredientCard} onClick={onClick}>
      <div className={styles.ingredientHeader}>
        <h3 className={styles.ingredientTitle}>{name}</h3>
        {firstCategory && (
          <span className={styles.category}>
            {INGREDIENT_CATEGORY_MAP[firstCategory]?.emoji}
          </span>
        )}
        {isSystem && <span className={styles.systemBadge}>System</span>}
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

        {categories && categories.length > 0 && (
          <div className={styles.categoriesContainer}>
            {categories.map((cat) => (
              <div key={cat} className={styles.categoryBadge}>
                {INGREDIENT_CATEGORY_MAP[cat]?.emoji}{" "}
                {INGREDIENT_CATEGORY_MAP[cat]?.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientCard;
