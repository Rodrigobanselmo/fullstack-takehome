import { type NextRequest } from "next/server";
import { getUserFromCookie } from "~/lib/auth";
import { captureException } from "~/lib/error-reporting";
import { type AIMode, type PageContext, DEFAULT_AI_MODE } from "~/lib/ai-types";
import { streamRecipeAgent, type StreamEvent } from "~/server/ai";
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
  mode?: AIMode;
  pageContext?: PageContext;
}

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

    // Stream response using the recipe agent
    const agentStream = streamRecipeAgent({
      message: body.message,
      history: body.history,
      userId: user.id,
      mode: body.mode ?? DEFAULT_AI_MODE,
      pageContext: body.pageContext,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";

    // Track tool messages for updating their status
    const toolMessageIds = new Map<string, string>(); // toolName -> messageId

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of agentStream) {
            // Send the event to the client
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );

            // Save tool messages to database if threadId provided
            if (body.threadId) {
              if (event.type === "tool_start") {
                // Save tool start message
                const toolMsg = await aiThreadRepository.addToolMessage(
                  body.threadId,
                  `${event.tool}...`,
                  event.tool,
                  "running",
                );
                toolMessageIds.set(event.tool, toolMsg.id);
              } else if (event.type === "tool_end") {
                // Update tool message with final status
                const messageId = toolMessageIds.get(event.tool);
                if (messageId) {
                  const content = event.success
                    ? `✓ ${event.tool}`
                    : `✗ ${event.tool}: ${event.result}`;
                  await aiThreadRepository.updateToolMessage(
                    messageId,
                    content,
                    event.success ? "success" : "error",
                  );
                }
              }
            }

            // Accumulate content for saving to database
            if (event.type === "content") {
              fullResponse += event.content;
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
          // Send error event to client
          const errorEvent: StreamEvent = {
            type: "error",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`),
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
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
