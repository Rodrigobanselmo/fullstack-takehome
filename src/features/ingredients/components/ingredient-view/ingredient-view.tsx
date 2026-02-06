import type { IngredientCategory } from "generated/gql/graphql";
import { INGREDIENT_CATEGORY_MAP } from "../../constants/ingredient-category-map";
import styles from "./ingredient-view.module.css";

interface IngredientViewProps {
  name: string;
  description?: string | null;
  categories?: IngredientCategory[] | null;
  defaultUnit?: string | null;
  averagePrice?: number | null;
  priceUnit?: string | null;
  priceCurrency?: string | null;
  isSystem?: boolean;
}

export default function IngredientView({
  name,
  description,
  categories,
  defaultUnit,
  averagePrice,
  priceUnit,
  priceCurrency,
  isSystem,
}: IngredientViewProps) {
  const firstCategory = categories?.[0];

  return (
    <div className={styles.ingredientView}>
      <div className={styles.header}>
        <h1 className={styles.title}>{name}</h1>
        {firstCategory && (
          <span className={styles.categoryIcon}>
            {INGREDIENT_CATEGORY_MAP[firstCategory]?.emoji}
          </span>
        )}
        {isSystem && <span className={styles.systemBadge}>System</span>}
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.detailsSection}>
        <h3 className={styles.sectionTitle}>Details</h3>
        <div className={styles.detailsGrid}>
          {categories && categories.length > 0 && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Categories:</span>
              <span className={styles.detailValue}>
                {categories.map((cat) => (
                  <span key={cat} className={styles.categoryTag}>
                    {INGREDIENT_CATEGORY_MAP[cat]?.emoji}{" "}
                    {INGREDIENT_CATEGORY_MAP[cat]?.label}
                  </span>
                ))}
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
