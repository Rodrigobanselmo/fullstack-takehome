import styles from "./recipe-groups-grid.module.css";

interface RecipeGroupsGridProps {
  children: React.ReactNode;
}

export default function RecipeGroupsGrid({ children }: RecipeGroupsGridProps) {
  return <div className={styles.recipeGroupsGrid}>{children}</div>;
}
