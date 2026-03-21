import {
  streamRecipeAgent,
  type StreamEvent as RecipeStreamEvent,
} from "./recipe-agent";
import type { AIMode, PageContext } from "~/lib/ai-types";
import type { AIMessageAttachment } from "~/server/repositories/ai-thread.repository";

/**
 * Available agent types
 */
export type AgentType = "recipe";

/**
 * Agent metadata for display
 */
export const AGENT_METADATA: Record<
  AgentType,
  { name: string; description: string }
> = {
  recipe: {
    name: "Recipe Agent",
    description: "Your AI cooking assistant",
  },
};

/**
 * Simplified attachment info for the supervisor input
 */
export interface SupervisorAttachment {
  key: string;
  bucket: string;
  region: string;
  mimeType: string;
  filename: string;
}

export interface SupervisorInput {
  message: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: AIMessageAttachment[];
  }>;
  attachments?: SupervisorAttachment[];
  userId: string;
  mode?: AIMode;
  pageContext?: PageContext;
}

/**
 * Extended stream events to include agent routing information
 */
export type StreamEvent =
  | RecipeStreamEvent
  | { type: "agent_start"; agent: AgentType; description: string }
  | { type: "agent_end"; agent: AgentType; success: boolean };

/**
 * Streams the supervisor agent response
 * Simplified to always use Recipe Agent (which handles both recipes and general conversation)
 */
export async function* streamSupervisorAgent(
  input: SupervisorInput,
): AsyncGenerator<StreamEvent, void, undefined> {
  try {
    const selectedAgent: AgentType = "recipe";

    // Emit agent start event
    yield {
      type: "agent_start",
      agent: selectedAgent,
      description: AGENT_METADATA[selectedAgent].description,
    };

    // Delegate to Recipe Agent - pass through all events
    for await (const event of streamRecipeAgent(input)) {
      yield event;
    }

    // Emit agent end event
    yield {
      type: "agent_end",
      agent: selectedAgent,
      success: true,
    };
  } catch (error) {
    // Emit error event
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    yield {
      type: "error",
      message: errorMessage,
    };
  }
}
