import { gql, useQuery } from "@apollo/client";
import type { ConversationsQuery } from "generated/gql/graphql";

const CONVERSATIONS_QUERY = gql`
  query Conversations {
    conversations {
      id
      createdAt
      updatedAt
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

export function useQueryConversations() {
  return useQuery<ConversationsQuery>(CONVERSATIONS_QUERY, {
    fetchPolicy: "cache-and-network",
  });
}
