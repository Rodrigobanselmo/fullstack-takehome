import { LoginContainer } from "~/features/auth/components/login-container/login-container";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <h2 className={styles.title}>Sign in to your account</h2>
        <LoginContainer />
      </div>
    </div>
  );
}
