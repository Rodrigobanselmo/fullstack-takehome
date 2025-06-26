export interface FindAndValidateConversationArgs {
  conversationId: string;
  userId: string;
}

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

export type RawConversationRow = {
  id: string;
  contractor_id: string;
  contractor_name: string;
  homeowner_id: string;
  homeowner_name: string;
  created_at: string;
  updated_at: string;
};
