"use client";

import type { Conversation } from "generated/gql/graphql";
import styles from "./conversation-list.module.css";
import ConversationListEmpty from "./components/conversation-list-empty/conversation-list-empty";
import ConversationListLoading from "./components/conversation-list-loading/conversation-list-loading";

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
    return <ConversationListLoading />;
  }

  if (conversations.length === 0) {
    return <ConversationListEmpty />;
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
