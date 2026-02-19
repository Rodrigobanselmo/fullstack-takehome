import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { createLLM } from "./llm";

// Define the state annotation for the chat agent
const ChatState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  response: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),
});

type ChatStateType = typeof ChatState.State;

// System prompt for the chat agent
const SYSTEM_PROMPT = `You are a helpful assistant. You help users with their questions and provide helpful, accurate, and concise responses. Be friendly and professional.`;

/**
 * Chat node - processes the user message and generates a response
 */
async function chatNode(state: ChatStateType): Promise<Partial<ChatStateType>> {
  const llm = createLLM();

  const messagesWithSystem = [
    new SystemMessage(SYSTEM_PROMPT),
    ...state.messages,
  ];

  const response = await llm.invoke(messagesWithSystem);
  const responseText =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  return {
    messages: [new AIMessage(responseText)],
    response: responseText,
  };
}

/**
 * Creates the chat agent graph
 */
function createChatGraph() {
  const graph = new StateGraph(ChatState)
    .addNode("chat", chatNode)
    .addEdge(START, "chat")
    .addEdge("chat", END);

  return graph.compile();
}

// Singleton instance of the compiled graph
let chatAgentInstance: ReturnType<typeof createChatGraph> | null = null;

function getChatAgent() {
  if (!chatAgentInstance) {
    chatAgentInstance = createChatGraph();
  }
  return chatAgentInstance;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatAgentInput {
  message: string;
  history?: ChatMessage[];
}

export interface ChatAgentOutput {
  response: string;
  messages: ChatMessage[];
}

/**
 * Invokes the chat agent with a message and optional history
 */
export async function invokeChatAgent(
  input: ChatAgentInput,
): Promise<ChatAgentOutput> {
  const agent = getChatAgent();

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
    response: "",
  });

  // Convert back to simple format
  const outputMessages: ChatMessage[] = result.messages.map(
    (msg: BaseMessage) => ({
      role:
        msg._getType() === "human" ? ("user" as const) : ("assistant" as const),
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }),
  );

  return {
    response: result.response,
    messages: outputMessages,
  };
}
