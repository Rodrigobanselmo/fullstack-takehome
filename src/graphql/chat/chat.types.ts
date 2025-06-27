export interface FindMessagesArgs {
  conversationId: string;
  userId: string;
  pagination: { first?: number | null; after?: string | null };
}

export interface CreateMessageArgs {
  conversationId: string;
  text: string;
  senderId: string;
}

export interface FindConversationsArgs {
  userId: string;
}

export interface FindConversationByIdArgs {
  conversationId: string;
  userId: string;
}

export interface FindConversationByParticipantsArgs {
  contractorId: string;
  homeownerId: string;
  userId: string;
}
