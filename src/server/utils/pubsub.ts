import { captureException } from "~/lib/error-reporting";

type Callback = (message: unknown) => void;

const subscribers: Record<string, Set<Callback>> = {};

export function subscribe(conversationId: string, cb: Callback) {
  if (!subscribers[conversationId]) {
    subscribers[conversationId] = new Set();
  }
  subscribers[conversationId].add(cb);
  return () => {
    if (subscribers[conversationId]) {
      subscribers[conversationId].delete(cb);
    }
  };
}

export function publish(conversationId: string, message: unknown) {
  if (subscribers[conversationId]) {
    for (const cb of subscribers[conversationId]) {
      try {
        cb(message);
      } catch (error) {
        captureException(error, {
          conversationId,
          message: "Error in pubsub subscriber",
        });
      }
    }
  }
}
