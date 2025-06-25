import type { ConversationQuery } from "generated/gql/graphql";

export const extractConversationUserName = (
  currentUserId: string,
  conversation?: ConversationQuery["conversation"] | null,
) => {
  if (!conversation) return "Conversation";

  return conversation.contractor.id === currentUserId
    ? conversation.homeowner.name
    : conversation.contractor.name;
};
