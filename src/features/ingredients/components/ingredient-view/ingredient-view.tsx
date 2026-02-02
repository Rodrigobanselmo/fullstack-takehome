import type { IngredientCategory } from "generated/gql/graphql";
import { INGREDIENT_CATEGORY_MAP } from "../../constants/ingredient-category-map";
import styles from "./ingredient-view.module.css";

interface IngredientViewProps {
  name: string;
  description?: string | null;
  category?: IngredientCategory | null;
  defaultUnit?: string | null;
  averagePrice?: number | null;
  priceUnit?: string | null;
  priceCurrency?: string | null;
}

export default function IngredientView({
  name,
  description,
  category,
  defaultUnit,
  averagePrice,
  priceUnit,
  priceCurrency,
}: IngredientViewProps) {
  return (
    <div className={styles.ingredientView}>
      <div className={styles.header}>
        <h1 className={styles.title}>{name}</h1>
        {category && (
          <span className={styles.categoryIcon}>
            {INGREDIENT_CATEGORY_MAP[category]?.emoji}
          </span>
        )}
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.detailsSection}>
        <h3 className={styles.sectionTitle}>Details</h3>
        <div className={styles.detailsGrid}>
          {category && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Category:</span>
              <span className={styles.detailValue}>
                {INGREDIENT_CATEGORY_MAP[category]?.emoji}{" "}
                {INGREDIENT_CATEGORY_MAP[category]?.label}
              </span>
            </div>
          )}

          {defaultUnit && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Default Unit:</span>
              <span className={styles.detailValue}>{defaultUnit}</span>
            </div>
          )}

          {averagePrice !== null && averagePrice !== undefined && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Average Price:</span>
              <span className={styles.detailValue}>
                {priceCurrency || "$"}
                {averagePrice.toFixed(2)}
                {priceUnit && ` / ${priceUnit}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
