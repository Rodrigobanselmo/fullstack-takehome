import styles from "./ingredients-grid.module.css";

interface IngredientsGridProps {
  children: React.ReactNode;
}

export default function IngredientsGrid({ children }: IngredientsGridProps) {
  return <div className={styles.ingredientsGrid}>{children}</div>;
}
