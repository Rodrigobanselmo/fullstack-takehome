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
import {
  type AIMode,
  type PageContext,
  DEFAULT_AI_MODE,
  describePageContext,
} from "~/lib/ai-types";
import { getPresignedDownloadUrl } from "~/lib/s3";
import type { AIMessageAttachment } from "~/server/repositories/ai-thread.repository";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

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

/** Simplified attachment info for the agent input */
export interface AgentAttachment {
  key: string;
  bucket: string;
  region: string;
  mimeType: string;
  filename: string;
}

export interface RecipeAgentInput {
  message: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: AIMessageAttachment[];
  }>;
  /** Attachments for the current user message */
  attachments?: AgentAttachment[];
  userId: string;
  mode?: AIMode;
  /** Context about which page/view the user is currently on */
  pageContext?: PageContext;
}

export interface RecipeAgentOutput {
  response: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Fetches a file from S3 and returns the ArrayBuffer
 */
async function fetchFileBuffer(attachment: AgentAttachment): Promise<Buffer> {
  const presignedUrl = await getPresignedDownloadUrl(
    {
      key: attachment.key,
      bucket: attachment.bucket,
      region: attachment.region,
    },
    3600, // 1 hour expiry
  );

  const response = await fetch(presignedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Fetches a file from S3 and returns it as a base64 data URL
 */
async function fetchFileAsBase64DataUrl(
  attachment: AgentAttachment,
): Promise<string> {
  const buffer = await fetchFileBuffer(attachment);
  const base64 = buffer.toString("base64");
  return `data:${attachment.mimeType};base64,${base64}`;
}

/**
 * Check if MIME type is an Excel file (not CSV)
 */
function isExcelMimeType(mimeType: string): boolean {
  return (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

/**
 * Parse Excel file and convert to CSV text
 * Limits output to prevent token overflow
 */
function parseExcelToCSV(buffer: Buffer, filename: string): string {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const results: string[] = [];

    // Process each sheet (limit to first 3 sheets for performance)
    const sheetsToProcess = workbook.SheetNames.slice(0, 3);

    for (const sheetName of sheetsToProcess) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      // Convert to CSV with reasonable limits
      const csv = XLSX.utils.sheet_to_csv(sheet, {
        blankrows: false, // Skip blank rows
      });

      // Limit rows to prevent token overflow (max ~100 rows per sheet)
      const lines = csv.split("\n");
      const limitedLines = lines.slice(0, 100);
      const truncated = lines.length > 100;

      const sheetContent = limitedLines.join("\n");
      if (sheetContent.trim()) {
        results.push(
          `--- Sheet: ${sheetName} ---\n${sheetContent}${truncated ? `\n... (${lines.length - 100} more rows truncated)` : ""}`,
        );
      }
    }

    if (workbook.SheetNames.length > 3) {
      results.push(
        `\n... (${workbook.SheetNames.length - 3} more sheets not shown)`,
      );
    }

    return `[Excel File: ${filename}]\n${results.join("\n\n")}`;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    return `[Excel File: ${filename}]\nError: Could not parse Excel file. The file may be corrupted or in an unsupported format.`;
  }
}

/**
 * Check if MIME type is a DOCX/DOC file
 */
function isDocxMimeType(mimeType: string): boolean {
  return (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

/**
 * Check if MIME type is a plain text file
 */
function isTextMimeType(mimeType: string): boolean {
  return mimeType === "text/plain";
}

/**
 * Parse DOCX file and extract text content
 */
async function parseDocxToText(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value.trim();

  // Limit text length to prevent token overflow (max ~50k characters)
  const maxChars = 50000;
  if (text.length > maxChars) {
    return `[Word Document: ${filename}]\n${text.slice(0, maxChars)}\n... (${text.length - maxChars} more characters truncated)`;
  }

  return `[Word Document: ${filename}]\n${text}`;
}

/**
 * Parse text file content
 */
function parseTextFile(buffer: Buffer, filename: string): string {
  const text = buffer.toString("utf-8").trim();

  // Limit text length to prevent token overflow (max ~50k characters)
  const maxChars = 50000;
  if (text.length > maxChars) {
    return `[Text File: ${filename}]\n${text.slice(0, maxChars)}\n... (${text.length - maxChars} more characters truncated)`;
  }

  return `[Text File: ${filename}]\n${text}`;
}

/**
 * Creates a multimodal HumanMessage with text and file attachments
 * Converts files to base64 data URLs as required by LangChain/LLMs
 * Excel, DOCX, and TXT files are parsed to text since Gemini doesn't support them natively
 */
async function createMultimodalHumanMessage(
  text: string,
  attachments?: AgentAttachment[],
): Promise<HumanMessage> {
  // If no attachments, return simple text message
  if (!attachments || attachments.length === 0) {
    return new HumanMessage(text);
  }

  // Build content array with text and media parts
  const contentParts: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail?: string } }
  > = [{ type: "text", text }];

  for (const attachment of attachments) {
    // Excel files: parse to CSV text (Gemini doesn't support Excel natively)
    if (isExcelMimeType(attachment.mimeType)) {
      const buffer = await fetchFileBuffer(attachment);
      const csvText = parseExcelToCSV(buffer, attachment.filename);
      contentParts.push({ type: "text", text: csvText });
      continue;
    }

    // DOCX files: parse to text (Gemini doesn't support DOCX natively)
    if (isDocxMimeType(attachment.mimeType)) {
      const buffer = await fetchFileBuffer(attachment);
      const docxText = await parseDocxToText(buffer, attachment.filename);
      contentParts.push({ type: "text", text: docxText });
      continue;
    }

    // Plain text files: read content directly
    if (isTextMimeType(attachment.mimeType)) {
      const buffer = await fetchFileBuffer(attachment);
      const txtContent = parseTextFile(buffer, attachment.filename);
      contentParts.push({ type: "text", text: txtContent });
      continue;
    }

    // For images, use image_url content type (works with both Gemini and OpenAI)
    if (attachment.mimeType.startsWith("image/")) {
      const dataUrl = await fetchFileAsBase64DataUrl(attachment);
      contentParts.push({
        type: "image_url",
        image_url: { url: dataUrl, detail: "auto" },
      });
    }
    // For other file types (video, audio, PDF, CSV), Gemini can handle them
    else if (
      attachment.mimeType.startsWith("video/") ||
      attachment.mimeType.startsWith("audio/") ||
      attachment.mimeType === "application/pdf" ||
      attachment.mimeType === "text/csv" ||
      attachment.mimeType === "application/csv"
    ) {
      const dataUrl = await fetchFileAsBase64DataUrl(attachment);
      contentParts.push({
        type: "image_url",
        image_url: { url: dataUrl },
      });
    }
  }

  return new HumanMessage({ content: contentParts });
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

  // Convert history to LangChain messages (with multimodal support)
  const historyMessages: BaseMessage[] = await Promise.all(
    (input.history ?? []).map(async (msg) => {
      if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      }
      // For user messages, check if they have attachments
      if (msg.attachments && msg.attachments.length > 0) {
        const attachmentsForMessage: AgentAttachment[] = msg.attachments.map(
          (att) => ({
            key: att.key,
            bucket: att.bucket,
            region: att.region,
            mimeType: att.mimeType,
            filename: att.filename,
          }),
        );
        return createMultimodalHumanMessage(msg.content, attachmentsForMessage);
      }
      return new HumanMessage(msg.content);
    }),
  );

  // Build system prompt with optional page context
  let systemPrompt = RECIPE_SYSTEM_PROMPT;
  if (input.pageContext) {
    const contextDescription = describePageContext(input.pageContext);
    systemPrompt += `\n\nCurrent context: ${contextDescription}`;
    // Check if user is viewing a specific entity
    const hasEntityId =
      input.pageContext.recipeId ||
      input.pageContext.ingredientId ||
      input.pageContext.recipeGroupId;
    if (hasEntityId) {
      systemPrompt += ` You can use this ID to fetch details about what the user is viewing if relevant to their question.`;
    }
  }

  // Create the current user message (possibly multimodal)
  const currentUserMessage = await createMultimodalHumanMessage(
    input.message,
    input.attachments,
  );

  const messagesWithSystem = [
    new SystemMessage(systemPrompt),
    ...historyMessages,
    currentUserMessage,
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
