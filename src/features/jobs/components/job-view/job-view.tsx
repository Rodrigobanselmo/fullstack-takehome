import type { JobStatus } from "generated/gql/graphql";
import { useRouter } from "next/navigation";
import { paths } from "~/config/paths";
import Button from "../../../../components/ui/button/button";
import { useQueryJobConversation } from "../../api/use-query-job-conversation";
import { JOB_STATUS_MAP } from "../../constants/job-status-map";
import styles from "./job-view.module.css";

interface JobViewProps {
  description: string;
  location: string;
  status: JobStatus;
  cost: number;
  name: string;
  homeownerId: string;
  contractorId: string;
  onEdit?: () => void;
}

export default function JobView({
  description,
  location,
  status,
  cost,
  onEdit,
  name,
  homeownerId,
  contractorId,
}: JobViewProps) {
  const router = useRouter();
  const { data: conversationData, loading: loadingConversation } =
    useQueryJobConversation({
      contractorId,
      homeownerId,
    });

  const onChat = async () => {
    if (conversationData?.conversationByParticipants?.id) {
      const conversationId = conversationData.conversationByParticipants.id;
      router.push(paths.dashboard.chat.conversation.getHref(conversationId));
    }
  };

  return (
    <div className={styles.viewSection}>
      <div className={styles.field}>
        <span className={styles.label}>Description</span>
        <span className={styles.value}>{description}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Location</span>
        <span className={styles.value}>{location}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Status</span>
        <span className={styles.value}>{JOB_STATUS_MAP[status]}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Cost ($)</span>
        <span className={styles.value}>{cost}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Homeowner</span>
        <span className={styles.value}>{name}</span>
      </div>
      <div className={styles.actions}>
        <Button
          onClick={onChat}
          color="secondary"
          variant={onEdit ? "outline" : "fill"}
          size="lg"
          minWidth="100px"
          disabled={loadingConversation}
        >
          {loadingConversation ? "Loading..." : "Go to Chat"}
        </Button>
        {onEdit && (
          <Button onClick={onEdit} size="lg" minWidth="100px">
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
