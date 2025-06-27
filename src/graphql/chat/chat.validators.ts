import { z } from "zod";

export const sendMessageInputSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  text: z.string().min(1, "Message text is required"),
});

export const messagesQuerySchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  first: z.number().int().nonnegative().optional(),
  after: z.string().optional(),
});

export const conversationQuerySchema = z.object({
  id: z.string().min(1, "Conversation ID is required"),
});

export const conversationByParticipantsQuerySchema = z.object({
  contractorId: z.string().min(1, "Contractor ID is required"),
  homeownerId: z.string().min(1, "Homeowner ID is required"),
});
