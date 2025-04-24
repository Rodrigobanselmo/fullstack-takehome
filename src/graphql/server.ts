import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

// Create the Apollo Server instance
export function createApolloServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
}
