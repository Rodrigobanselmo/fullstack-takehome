"use client";

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
  type FieldFunctionOptions,
} from "@apollo/client";
import { useMemo } from "react";

function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: "/api/graphql",
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            messages: {
              keyArgs: ["conversationId"],
              merge(
                existing: { edges: unknown[]; pageInfo: unknown } = {
                  edges: [],
                  pageInfo: {},
                },
                incoming: { edges: unknown[]; pageInfo: unknown },
                options: FieldFunctionOptions,
              ) {
                const args = options.args || {};
                if (!args.after) {
                  return incoming;
                }
                return {
                  ...incoming,
                  edges: [...(existing.edges || []), ...incoming.edges],
                };
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createApolloClient(), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
