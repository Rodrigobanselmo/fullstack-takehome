import { LoginForm } from "../login-form/login-form";
import styles from "./login-container.module.css";

export function LoginContainer() {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <h2 className={styles.title}>Sign in to your account</h2>
        <LoginForm />
      </div>
    </div>
  );
}
