import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { createContext } from "~/graphql/context";
import { createApolloServer } from "~/graphql/server";
import type { NextRequest } from "next/server";

const server = createApolloServer();

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => createContext(req),
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
