import { type NextRequest } from "next/server";
import { captureException } from "~/lib/error-reporting";
import { subscribe } from "~/server/utils/pubsub";
import { getUserFromCookie } from "~/lib/auth";
import { conversationRepository } from "~/server/repositories/conversation.repository";

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
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const stream = new ReadableStream({
      start(controller) {
        const unsubscribe = subscribe(conversationId, (message) => {
          try {
            controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
          } catch (error) {
            captureException(error, {
              conversationId,
              userId: user.id,
              message: "Error sending message to client",
            });
            unsubscribe();
          }
        });

        return () => {
          unsubscribe();
        };
      },
    });

    return new Response(stream, { headers });
  } catch (error) {
    captureException(error, {
      conversationId,
      message: "Unexpected error in SSE endpoint",
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
