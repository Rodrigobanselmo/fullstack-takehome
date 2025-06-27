import styles from "./page-header.module.css";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  onBack?: () => void;
}

export default function PageHeader({
  title,
  children,
  onBack,
}: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>
        {onBack && (
          <button
            onClick={onBack}
            className={styles.backButton}
            aria-label="Go back"
          >
            ←
          </button>
        )}
        <h1 className={styles.title} title={title}>
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
