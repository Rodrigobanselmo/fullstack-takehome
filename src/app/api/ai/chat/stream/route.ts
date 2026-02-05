import { type NextRequest } from "next/server";
import { getUserFromCookie } from "~/lib/auth";
import { captureException } from "~/lib/error-reporting";
import { createLLM } from "~/server/ai";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { aiThreadRepository } from "~/server/repositories/ai-thread.repository";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  threadId?: string;
}

const SYSTEM_PROMPT = `You are a helpful assistant. You help users with their questions and provide helpful, accurate, and concise responses. Be friendly and professional.`;

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromCookie();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = (await req.json()) as ChatRequestBody;

    if (!body.message || typeof body.message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert history to LangChain messages
    const historyMessages: BaseMessage[] = (body.history ?? []).map((msg) =>
      msg.role === "user"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content),
    );

    // Build messages array with system prompt
    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      ...historyMessages,
      new HumanMessage(body.message),
    ];

    // If threadId is provided, verify and save user message
    if (body.threadId) {
      const thread = await aiThreadRepository.findById(body.threadId, user.id);
      if (!thread) {
        return new Response(JSON.stringify({ error: "Thread not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      await aiThreadRepository.addMessage(body.threadId, "user", body.message);
    }

    // Create LLM and stream response
    const llm = createLLM({ temperature: 0.7 });
    const stream = await llm.stream(messages);

    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content =
              typeof chunk.content === "string"
                ? chunk.content
                : JSON.stringify(chunk.content);

            if (content) {
              fullResponse += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
              );
            }
          }

          // Save assistant message to database if threadId provided
          if (body.threadId && fullResponse) {
            await aiThreadRepository.addMessage(
              body.threadId,
              "assistant",
              fullResponse,
            );
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          captureException(error, { context: "AI Chat Stream" });
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    captureException(error, { context: "AI Chat Stream API" });
    console.error("AI Chat Stream error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to process chat message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

