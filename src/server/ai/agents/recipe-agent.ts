import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { createLLM } from "../llm";
import { createRecipeTools } from "../tools/recipe.tools";
import { type AIMode, DEFAULT_AI_MODE } from "~/lib/ai-types";

// System prompt for the recipe agent
const RECIPE_SYSTEM_PROMPT = `You are a helpful recipe assistant. You help users manage their recipes, ingredients, and recipe groups (collections of recipes).

You have access to tools that allow you to:
- List, create, update, and delete recipes
- List, create, update, and delete ingredients
- List, create, update, and delete recipe groups
- Add or remove recipes from groups

When the user asks about their recipes, ingredients, or groups, use the appropriate tools to help them.
When creating recipes, make sure to ask for or infer:
- Recipe name
- Number of servings
- List of ingredients with quantities and units

Be helpful, friendly, and proactive in suggesting improvements to recipes or organization.
Always confirm before deleting anything.
Format your responses in a clear, readable way.`;

// Define the state annotation for the recipe agent
const RecipeAgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  userId: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),
});

type RecipeAgentStateType = typeof RecipeAgentState.State;

/**
 * Determines if the agent should continue to tools or end
 */
function shouldContinue(state: RecipeAgentStateType): "tools" | typeof END {
  const lastMessage = state.messages[state.messages.length - 1];

  // Check if the last message has tool calls
  if (
    lastMessage &&
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  return END;
}

/**
 * Agent node - processes messages and decides on actions
 */
async function agentNode(
  state: RecipeAgentStateType,
): Promise<Partial<RecipeAgentStateType>> {
  const tools = createRecipeTools(state.userId);
  const baseLLM = createLLM();
  const llm = baseLLM.bindTools!(tools);

  const messagesWithSystem = [
    new SystemMessage(RECIPE_SYSTEM_PROMPT),
    ...state.messages,
  ];

  const response = await llm.invoke(messagesWithSystem);

  return {
    messages: [response],
  };
}

/**
 * Creates the recipe agent graph for a specific user
 */
function createRecipeAgentGraph(userId: string) {
  const tools = createRecipeTools(userId);
  const toolNode = new ToolNode(tools);

  const graph = new StateGraph(RecipeAgentState)
    .addNode("agent", agentNode)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue, {
      tools: "tools",
      [END]: END,
    })
    .addEdge("tools", "agent");

  return graph.compile();
}

export interface RecipeAgentInput {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  userId: string;
  mode?: AIMode;
}

export interface RecipeAgentOutput {
  response: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Invokes the recipe agent with a message and history
 */
export async function invokeRecipeAgent(
  input: RecipeAgentInput,
): Promise<RecipeAgentOutput> {
  const agent = createRecipeAgentGraph(input.userId);

  // Convert history to LangChain messages
  const historyMessages: BaseMessage[] = (input.history ?? []).map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content),
  );

  // Add the new user message
  const allMessages = [...historyMessages, new HumanMessage(input.message)];

  const result = await agent.invoke({
    messages: allMessages,
    userId: input.userId,
  });

  // Get the final response (last AI message that's not a tool call)
  const aiMessages = result.messages.filter(
    (msg: BaseMessage) =>
      msg instanceof AIMessage &&
      (!("tool_calls" in msg) ||
        !Array.isArray(msg.tool_calls) ||
        msg.tool_calls.length === 0),
  );
  const lastAiMessage = aiMessages[aiMessages.length - 1];
  const responseText = lastAiMessage
    ? typeof lastAiMessage.content === "string"
      ? lastAiMessage.content
      : JSON.stringify(lastAiMessage.content)
    : "";

  // Convert messages to simple format (excluding tool messages)
  const outputMessages = result.messages
    .filter(
      (msg: BaseMessage) =>
        msg instanceof HumanMessage ||
        (msg instanceof AIMessage &&
          (!("tool_calls" in msg) ||
            !Array.isArray(msg.tool_calls) ||
            msg.tool_calls.length === 0)),
    )
    .map((msg: BaseMessage) => ({
      role:
        msg instanceof HumanMessage
          ? ("user" as const)
          : ("assistant" as const),
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));

  return {
    response: responseText,
    messages: outputMessages,
  };
}

// Event types for streaming
export type StreamEvent =
  | { type: "content"; content: string }
  | { type: "tool_start"; tool: string; args: Record<string, unknown> }
  | { type: "tool_end"; tool: string; result: string; success: boolean }
  | { type: "error"; message: string };

/**
 * Streams the recipe agent response
 * Returns an async generator that yields StreamEvent objects
 *
 * @param input.mode - "fast" uses gpt-5-mini for quick responses,
 *                     "smarter" uses gpt-5.2 with more tokens for detailed responses
 */
export async function* streamRecipeAgent(
  input: RecipeAgentInput,
): AsyncGenerator<StreamEvent, void, undefined> {
  const tools = createRecipeTools(input.userId);
  const mode = input.mode ?? DEFAULT_AI_MODE;

  // Configure LLM based on mode (model selection handled by createLLM)
  const baseLLM = createLLM({ mode });
  const llm = baseLLM.bindTools!(tools);

  // Convert history to LangChain messages
  const historyMessages: BaseMessage[] = (input.history ?? []).map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content),
  );

  const messagesWithSystem = [
    new SystemMessage(RECIPE_SYSTEM_PROMPT),
    ...historyMessages,
    new HumanMessage(input.message),
  ];

  let currentMessages = messagesWithSystem;
  let iterations = 0;
  const maxIterations = 300; // Prevent infinite loops

  while (iterations < maxIterations) {
    iterations++;
    const response = await llm.invoke(currentMessages);

    // Check if there are tool calls
    if (
      "tool_calls" in response &&
      Array.isArray(response.tool_calls) &&
      response.tool_calls.length > 0
    ) {
      // Execute tools
      currentMessages = [...currentMessages, response];

      for (const toolCall of response.tool_calls) {
        const tool = tools.find((t) => t.name === toolCall.name);
        if (tool) {
          // Emit tool start event
          yield {
            type: "tool_start",
            tool: toolCall.name,
            args: toolCall.args as Record<string, unknown>,
          };

          try {
            const toolResult = await (
              tool.invoke as (args: unknown) => Promise<string>
            )(toolCall.args);
            const resultStr =
              typeof toolResult === "string"
                ? toolResult
                : JSON.stringify(toolResult);

            // Emit tool end event
            yield {
              type: "tool_end",
              tool: toolCall.name,
              result: resultStr,
              success: !resultStr.toLowerCase().startsWith("failed"),
            };

            currentMessages.push({
              role: "tool",
              content: resultStr,
              tool_call_id: toolCall.id,
              name: toolCall.name,
            } as unknown as BaseMessage);
          } catch (error) {
            const errorMsg =
              error instanceof Error ? error.message : "Unknown error";
            yield {
              type: "tool_end",
              tool: toolCall.name,
              result: errorMsg,
              success: false,
            };
            yield { type: "error", message: errorMsg };
          }
        }
      }
      // Continue loop to get final response
      continue;
    }

    // No tool calls - stream the final response
    const stream = await llm.stream(currentMessages);

    for await (const chunk of stream) {
      const content =
        typeof chunk.content === "string"
          ? chunk.content
          : Array.isArray(chunk.content)
            ? chunk.content
                .filter(
                  (c): c is { type: "text"; text: string } => c.type === "text",
                )
                .map((c) => c.text)
                .join("")
            : "";

      if (content) {
        yield { type: "content", content };
      }
    }

    break;
  }
}
