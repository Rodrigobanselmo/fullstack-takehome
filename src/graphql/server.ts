import { ApolloServer, type ApolloServerPlugin } from "@apollo/server";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import type { GraphQLContext } from "./context";

const DEV_LATENCY_MS = 300;

// Plugin to simulate network latency in development
function devLatencyPlugin(): ApolloServerPlugin<GraphQLContext> {
  return {
    async requestDidStart() {
      // Add delay before processing the request
      await new Promise((resolve) => setTimeout(resolve, DEV_LATENCY_MS));
      return {};
    },
  };
}

export function createApolloServer() {
  const plugins: ApolloServerPlugin<GraphQLContext>[] = [];

  // Only add latency in development
  if (process.env.NODE_ENV === "development") {
    plugins.push(devLatencyPlugin());
  }

  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins,
  });
}
