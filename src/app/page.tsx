import Link from "next/link";

import styles from "./index.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Create <span className={styles.pinkSpan}>T3</span> App with Apollo
        </h1>

        <div className={styles.cardRow}>
          <Link className={styles.card} href="/graphql-demo">
            <h3 className={styles.cardTitle}>GraphQL Demo →</h3>
            <div className={styles.cardText}>
              Try out the Apollo Client and Server with a simple message board
              example.
            </div>
          </Link>

          <Link
            className={styles.card}
            href="https://create.t3.gg/en/usage/first-steps"
            target="_blank"
          >
            <h3 className={styles.cardTitle}>First Steps →</h3>
            <div className={styles.cardText}>
              Just the basics - Everything you need to know to set up your
              database and authentication.
            </div>
          </Link>
          <Link
            className={styles.card}
            href="https://create.t3.gg/en/introduction"
            target="_blank"
          >
            <h3 className={styles.cardTitle}>Documentation →</h3>
            <div className={styles.cardText}>
              Learn more about Create T3 App, the libraries it uses, and how to
              deploy it.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
