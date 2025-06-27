import { gql, useQuery } from "@apollo/client";
import type {
  ConversationQuery,
  ConversationQueryVariables,
} from "generated/gql/graphql";

const CONVERSATION_QUERY = gql`
  query Conversation($id: ID!) {
    conversation(id: $id) {
      id
      contractor {
        id
        name
      }
      homeowner {
        id
        name
      }
    }
  }
`;

export function useQueryConversation(conversationId: string) {
  return useQuery<ConversationQuery, ConversationQueryVariables>(
    CONVERSATION_QUERY,
    {
      variables: { id: conversationId },
      fetchPolicy: "cache-and-network",
    },
  );
}
