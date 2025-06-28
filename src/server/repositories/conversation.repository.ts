import { prisma } from "~/server/database/prisma";
import type { Conversation } from "generated/gql/graphql";

class PrismaConversationRepository {
  async hasAccess(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ contractorId: userId }, { homeownerId: userId }],
      },
      select: { id: true },
    });

    return conversation !== null;
  }

  async findById(
    conversationId: string,
    userId: string,
  ): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ contractorId: userId }, { homeownerId: userId }],
      },
      include: {
        contractor: true,
        homeowner: true,
      },
    });

    if (!conversation) {
      return null;
    }

    return conversation;
  }

  async findByParticipants(
    contractorId: string,
    homeownerId: string,
    userId: string,
  ): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findFirst({
      where: {
        contractorId,
        homeownerId,
        OR: [{ contractorId: userId }, { homeownerId: userId }],
      },
      include: {
        contractor: true,
        homeowner: true,
      },
    });

    if (!conversation) {
      return null;
    }

    return conversation;
  }

  async findUserConversations(userId: string): Promise<Conversation[]> {
    const rawConversations = await prisma.$queryRaw<
      Array<{
        id: string;
        created_at: Date;
        updated_at: Date;
        contractor_id: string;
        contractor_name: string;
        homeowner_id: string;
        homeowner_name: string;
      }>
    >`
      WITH UserConversations AS (
          SELECT c.*
          FROM conversations c
          WHERE (c.contractor_id = ${userId} OR c.homeowner_id = ${userId})
      ),
      LatestMessageTimesForUserConversations AS (
          SELECT
              m.conversation_id,
              MAX(m.created_at) AS latest_message_at
          FROM messages m
          INNER JOIN UserConversations uc ON m.conversation_id = uc.id
          GROUP BY m.conversation_id
      )
      SELECT
        uc.id,
        uc.created_at AS created_at,
        uc.updated_at AS updated_at,
        u1.id AS contractor_id,
        u1.name AS contractor_name,
        u2.id AS homeowner_id,
        u2.name AS homeowner_name
      FROM UserConversations uc 
      LEFT JOIN users u1 ON uc.contractor_id = u1.id
      LEFT JOIN users u2 ON uc.homeowner_id = u2.id
      LEFT JOIN LatestMessageTimesForUserConversations lmt ON uc.id = lmt.conversation_id
      ORDER BY
          lmt.latest_message_at DESC NULLS LAST,
          uc.updated_at DESC;
    `;

    return rawConversations.map((row) => ({
      id: row.id,
      contractor: {
        id: row.contractor_id,
        name: row.contractor_name,
      },
      homeowner: {
        id: row.homeowner_id,
        name: row.homeowner_name,
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }
}

export const conversationRepository = new PrismaConversationRepository();
