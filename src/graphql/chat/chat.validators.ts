import { z } from "zod";

// Schema for SendMessageInput
export const sendMessageInputSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  text: z.string().min(1, "Message text is required"),
});

// Schema for messages query
export const messagesQuerySchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  first: z.number().int().nonnegative().optional(),
  after: z.string().optional(),
});

// Schema for conversation query
export const conversationQuerySchema = z.object({
  id: z.string().min(1, "Conversation ID is required"),
});

// Schema for conversationByParticipants query
export const conversationByParticipantsQuerySchema = z.object({
  contractorId: z.string().min(1, "Contractor ID is required"),
  homeownerId: z.string().min(1, "Homeowner ID is required"),
});
