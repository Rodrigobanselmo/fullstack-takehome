import { gql } from "@apollo/client";
import type { FragmentType } from "generated/gql/fragment-masking";
import { useFragment } from "generated/gql/fragment-masking";
import {
  RecipeViewFragmentDoc,
  RecipeViewIngredientFragmentDoc,
} from "generated/gql/graphql";
import { RECIPE_TAG_MAP } from "../../constants/recipe-tag-map";
import styles from "./recipe-view.module.css";

export const RECIPE_VIEW_INGREDIENT_FRAGMENT = gql`
  fragment RecipeViewIngredient on RecipeIngredient {
    id
    ingredientId
    quantity
    unit
    notes
    optional
    ingredient {
      id
      name
    }
  }
`;

export const RECIPE_VIEW_FRAGMENT = gql`
  fragment RecipeView on Recipe {
    id
    name
    servings
    tags
    overallRating
    prepTimeMinutes
    ingredients {
      ...RecipeViewIngredient
    }
    createdAt
    updatedAt
  }
  ${RECIPE_VIEW_INGREDIENT_FRAGMENT}
`;

interface RecipeViewProps {
  recipe: FragmentType<typeof RecipeViewFragmentDoc>;
}

interface IngredientItemProps {
  ingredient: FragmentType<typeof RecipeViewIngredientFragmentDoc>;
}

function IngredientItem({ ingredient }: IngredientItemProps) {
  const data = useFragment(RecipeViewIngredientFragmentDoc, ingredient);

  return (
    <li className={styles.ingredientItem}>
      <span className={styles.ingredientQuantity}>
        {data.quantity} {data.unit}
      </span>
      <span className={styles.ingredientName}>{data.ingredient.name}</span>
      {data.notes && (
        <span className={styles.ingredientNotes}>({data.notes})</span>
      )}
      {data.optional && <span className={styles.optionalBadge}>Optional</span>}
    </li>
  );
}

export default function RecipeView({ recipe }: RecipeViewProps) {
  const { name, servings, tags, overallRating, prepTimeMinutes, ingredients } =
    useFragment(RecipeViewFragmentDoc, recipe);

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
          {ingredients.map((ingredient, index) => (
            <IngredientItem key={index} ingredient={ingredient} />
          ))}
        </ul>
      </div>
    </div>
  );
}
