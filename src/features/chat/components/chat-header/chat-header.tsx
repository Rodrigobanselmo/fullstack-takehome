import { useRouter } from "next/navigation";
import Button from "~/components/ui/button/button";
import { getNameInitials } from "../../utils/get-name-initials";
import styles from "./chat-header.module.css";

interface ChatHeaderProps {
  name: string;
}

export default function ChatHeader({ name }: ChatHeaderProps) {
  const initials = getNameInitials(name);
  const router = useRouter();
  return (
    <div className={styles.header}>
      <div className={styles.avatar}>{initials}</div>
      <h1 className={styles.title}>{name}</h1>

      <Button
        variant="ghost"
        size="icon"
        className={styles.backButton}
        onClick={() => router.back()}
      >
        x
      </Button>
    </div>
  );
}
