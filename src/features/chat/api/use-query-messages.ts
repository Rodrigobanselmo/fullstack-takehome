import { gql, NetworkStatus, useQuery } from "@apollo/client";
import type {
  MessagesQuery,
  MessagesQueryVariables,
} from "generated/gql/graphql";
import { useCallback } from "react";

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
  const { fetchMore, data, networkStatus, ...rest } = useQuery<
    MessagesQuery,
    MessagesQueryVariables
  >(MESSAGES_QUERY, {
    variables: { conversationId, first: 15 },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = useCallback(async () => {
    if (!data?.messages.pageInfo.hasNextPage) return;
    await fetchMore({
      variables: {
        after: data.messages.pageInfo.endCursor,
        first: 10,
        conversationId,
      },
    });
  }, [fetchMore, conversationId, data]);

  return {
    data,
    loadMore,
    isFetching: networkStatus === NetworkStatus.fetchMore,
    isLoadingFirstPage: networkStatus === NetworkStatus.loading,
    ...rest,
  };
}
