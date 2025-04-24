import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { createApolloServer } from "~/graphql/server";

const server = createApolloServer();

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => ({ req }),
});

export { handler as GET, handler as POST };
