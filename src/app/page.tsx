import Link from "next/link";

import styles from "./index.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Handoff Full-Stack Takehome Exercise Starter Project
        </h1>

        <h3 className={styles.subtitle}>
          Welcome! Feel free to use the project to get started, or start from
          scratch with your own choice of tools.
        </h3>

        <div className={styles.cardRow}>
          <Link className={styles.card} href="/graphql-demo">
            <h3 className={styles.cardTitle}>GraphQL Demo →</h3>
            <div className={styles.cardText}>
              Try out the Apollo Client and Server with a simple message board
              example.
            </div>
          </Link>
        </div>
        <div className={styles.cardRow}>
          <Link className={styles.card} href="/graphql-demo">
            <h3 className={styles.cardTitle}>GraphQL Demo →</h3>
            <div className={styles.cardText}>
              Try out the Apollo Client and Server with a simple message board
              example.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
