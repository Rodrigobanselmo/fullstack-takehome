// In-memory data store for messages
let messages: { id: string; text: string; createdAt: string }[] = [];

export const resolvers = {
  Query: {
    hello: () => "Hello World!",
    messages: () => messages,
  },
  Mutation: {
    addMessage: (_: any, { text }: { text: string }) => {
      const newMessage = {
        id: String(messages.length + 1),
        text,
        createdAt: new Date().toISOString(),
      };
      
      messages.push(newMessage);
      return newMessage;
    },
  },
};
