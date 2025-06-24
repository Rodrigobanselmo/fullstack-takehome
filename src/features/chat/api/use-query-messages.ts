import { gql, useQuery } from "@apollo/client";
import type {
  MessagesQuery,
  MessagesQueryVariables,
} from "generated/gql/graphql";

export const MESSAGES_QUERY = gql`
  query Messages($conversationId: ID!, $first: Int, $after: String) {
    messages(conversationId: $conversationId, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          text
          createdAt
          sender {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export function useQueryMessages(conversationId: string) {
  return useQuery<MessagesQuery, MessagesQueryVariables>(MESSAGES_QUERY, {
    variables: { conversationId, first: 50 },
    fetchPolicy: "cache-and-network",
  });
}
