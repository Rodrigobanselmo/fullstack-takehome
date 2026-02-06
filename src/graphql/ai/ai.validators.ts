import { z } from "zod";

export const createAIThreadInputSchema = z.object({
  title: z.string().optional(),
});
export type CreateAIThreadInput = z.infer<typeof createAIThreadInputSchema>;

export const updateAIThreadInputSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  title: z.string().min(1, "Title is required"),
});
export type UpdateAIThreadInput = z.infer<typeof updateAIThreadInputSchema>;

export const sendAIThreadMessageInputSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  message: z.string().min(1, "Message is required"),
});
export type SendAIThreadMessageInput = z.infer<
  typeof sendAIThreadMessageInputSchema
>;

export const aiThreadIdSchema = z.object({
  id: z.string().min(1, "Thread ID is required"),
});
export type AIThreadIdArgs = z.infer<typeof aiThreadIdSchema>;

export const aiThreadMessagesSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
});
export type AIThreadMessagesArgs = z.infer<typeof aiThreadMessagesSchema>;
