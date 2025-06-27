import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { createContext } from "~/graphql/context";
import { createApolloServer } from "~/graphql/server";

const server = createApolloServer();

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => createContext(req),
});

export { handler as GET, handler as POST };
