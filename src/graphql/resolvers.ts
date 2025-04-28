import { type Message } from "../../generated/prisma";
import { db } from "~/server/db";

// Type for GraphQL Message (with string createdAt)
type GraphQLMessage = Omit<Message, "createdAt"> & { createdAt: string };

// Convert Prisma Message to GraphQL Message
const toGraphQLMessage = (message: Message): GraphQLMessage => ({
  ...message,
  createdAt: message.createdAt.toISOString(),
});

export const resolvers = {
  Query: {
    hello: () => "Hello World!",
    messages: async () => {
      // Fetch messages from the database using Prisma
      const messages = await db.message.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      // Convert the createdAt DateTime to ISO string for GraphQL
      return messages.map(toGraphQLMessage);
    },
  },
  Mutation: {
    addMessage: async (_: any, { text }: { text: string }) => {
      // Create a new message in the database using Prisma
      const newMessage = await db.message.create({
        data: {
          text,
        },
      });

      // Convert the createdAt DateTime to ISO string for GraphQL
      return toGraphQLMessage(newMessage);
    },
  },
};
