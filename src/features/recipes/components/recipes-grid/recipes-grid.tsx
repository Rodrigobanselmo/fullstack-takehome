import styles from "./recipes-grid.module.css";

interface RecipesGridProps {
  children: React.ReactNode;
}

export default function RecipesGrid({ children }: RecipesGridProps) {
  return <div className={styles.recipesGrid}>{children}</div>;
}
