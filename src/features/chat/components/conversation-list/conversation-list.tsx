"use client";

import type { Conversation } from "generated/gql/graphql";
import styles from "./conversation-list.module.css";

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

export default function ConversationList({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  loading,
}: ConversationListProps) {
  const getConversationTitle = (conversation: Conversation) => {
    const isContractor = conversation.contractor.id === currentUserId;
    const otherPerson = isContractor
      ? conversation.homeowner
      : conversation.contractor;
    return otherPerson.name;
  };

  const getConversationRole = (conversation: Conversation) => {
    const isContractor = conversation.contractor.id === currentUserId;
    return isContractor ? "Homeowner" : "Contractor";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Conversations</h2>
        </div>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyTitle}>Loading conversations...</div>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Conversations</h2>
        </div>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💬</div>
          <div className={styles.emptyTitle}>No conversations yet</div>
          <div className={styles.emptyMessage}>
            Start a conversation with someone to see it here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Conversations</h2>
      </div>
      <div className={styles.list}>
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`${styles.conversation} ${
              selectedConversationId === conversation.id ? styles.active : ""
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className={styles.name}>
              {getConversationTitle(conversation)}
            </div>
            <div className={styles.role}>
              {getConversationRole(conversation)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
