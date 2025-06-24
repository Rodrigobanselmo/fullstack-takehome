"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "~/context/user-context";
import { useQueryConversations } from "~/features/chat/api/use-query-conversations";
import ConversationList from "~/features/chat/components/conversation-list/conversation-list";
import styles from "./layout.module.css";
import { paths } from "~/config/paths";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const currentUserId = user.id;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const selectedConversationId =
    typeof params.conversationId === "string" ? params.conversationId : null;

  const { data, loading: conversationsLoading } = useQueryConversations();

  useEffect(() => {
    const firstConversationId = data?.conversations[0]?.id;
    if (firstConversationId && pathname === paths.dashboard.chat.getHref()) {
      router.replace(
        paths.dashboard.chat.conversation.getHref(firstConversationId),
      );
    }
  }, [data?.conversations, pathname, router]);

  const handleSelectConversation = (conversationId: string) => {
    router.push(paths.dashboard.chat.conversation.getHref(conversationId));
  };

  return (
    <div className={styles.container}>
      <ConversationList
        conversations={data?.conversations ?? []}
        currentUserId={currentUserId}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        loading={conversationsLoading}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
