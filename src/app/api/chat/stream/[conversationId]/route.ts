import { type NextRequest } from "next/server";
import { captureException } from "~/lib/error-reporting";
import { subscribe } from "~/server/utils/pubsub";
import { getUserFromCookie } from "~/lib/auth";
import { conversationRepository } from "~/server/repositories/conversation.repository";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } },
) {
  const { conversationId } = params;

  try {
    const user = await getUserFromCookie();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const hasAccess = await conversationRepository.hasAccess(
      conversationId,
      user.id,
    );

    if (!hasAccess) {
      return new Response("Forbidden", { status: 403 });
    }

    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "none",
    });

    const encoder = new TextEncoder();
    let heartbeatInterval: NodeJS.Timeout;
    let unsubscribe: () => void;

    const stream = new ReadableStream({
      start(controller) {
        heartbeatInterval = setInterval(() => {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 10000);

        unsubscribe = subscribe(conversationId, (message) => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(message)}\n\n`),
            );
          } catch (error) {
            captureException(error, {
              conversationId,
              userId: user.id,
              message: "Error sending message to client",
            });
            cleanup();
            controller.close();
          }
        });
      },
      cancel() {
        cleanup();
      },
    });

    function cleanup() {
      clearInterval(heartbeatInterval);
      unsubscribe?.();
    }

    return new Response(stream, { headers });
  } catch (error) {
    captureException(error, {
      conversationId,
      message: "Unexpected error in SSE endpoint",
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
