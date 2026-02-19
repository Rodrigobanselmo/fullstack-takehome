/**
 * Shared AI types used across the application
 */

/**
 * AI response mode that affects model selection and behavior
 * - "fast": Uses a faster, lighter model for quick responses
 * - "smarter": Uses a more capable model for complex reasoning
 */
export const AI_MODES = ["fast", "smarter"] as const;
export type AIMode = (typeof AI_MODES)[number];

export const AI_MODE_LABELS: Record<AIMode, string> = {
  fast: "Fast",
  smarter: "Smarter",
};

export const DEFAULT_AI_MODE: AIMode = "fast";

/**
 * Page sections the user can be viewing
 */
export const PAGE_SECTIONS = [
  "dashboard",
  "recipes",
  "ingredients",
  "recipe-groups",
  "chat",
] as const;
export type PageSection = (typeof PAGE_SECTIONS)[number];

/**
 * View types for detail pages
 */
export const VIEW_TYPES = ["list", "view", "edit", "add"] as const;
export type ViewType = (typeof VIEW_TYPES)[number];

/**
 * Route params from Next.js useParams()
 * These match the folder names: [recipeId], [ingredientId], [recipeGroupId], [conversationId]
 */
export interface RouteParams {
  recipeId?: string;
  ingredientId?: string;
  recipeGroupId?: string;
  conversationId?: string;
}

/**
 * Context about the current page the user is viewing
 * This helps the AI understand what the user is looking at
 */
export interface PageContext {
  /** The main section (recipes, ingredients, recipe-groups, etc.) */
  section: PageSection;
  /** The type of view (list, view, edit, add) */
  viewType: ViewType;
  /** Specific entity IDs from route params */
  recipeId?: string;
  ingredientId?: string;
  recipeGroupId?: string;
  conversationId?: string;
  /** The full pathname for reference */
  pathname: string;
}

/**
 * Input for creating a PageContext
 */
export interface PageContextInput {
  pathname: string;
  params: RouteParams;
}

/**
 * Extracts view type from path segments
 */
function extractViewType(segments: string[]): ViewType {
  for (const segment of segments) {
    if (VIEW_TYPES.includes(segment as ViewType)) {
      return segment as ViewType;
    }
  }
  return "list";
}

/**
 * Creates a PageContext from pathname and route params
 * Uses Next.js useParams() values directly - no regex needed!
 */
export function createPageContext(input: PageContextInput): PageContext {
  const { pathname, params } = input;
  const segments = pathname.split("/").filter(Boolean);

  // Default context
  const context: PageContext = {
    section: "dashboard",
    viewType: "list",
    pathname,
  };

  // Parse section from path: /dashboard/{section}/...
  if (segments[0] === "dashboard" && segments[1]) {
    const section = segments[1] as PageSection;
    if (PAGE_SECTIONS.includes(section)) {
      context.section = section;
    }
  }

  // Copy IDs directly from route params (type-safe, no parsing needed)
  if (params.recipeId) context.recipeId = params.recipeId;
  if (params.ingredientId) context.ingredientId = params.ingredientId;
  if (params.recipeGroupId) context.recipeGroupId = params.recipeGroupId;
  if (params.conversationId) context.conversationId = params.conversationId;

  // Extract view type from path segments
  context.viewType = extractViewType(segments);

  // If we have any ID but no explicit view type, default to "view"
  const hasId =
    context.recipeId ||
    context.ingredientId ||
    context.recipeGroupId ||
    context.conversationId;
  if (hasId && context.viewType === "list") {
    context.viewType = "view";
  }

  return context;
}

/**
 * Gets the current entity ID and its type from the context
 */
function getCurrentEntity(
  context: PageContext,
): { type: string; id: string } | null {
  if (context.ingredientId)
    return { type: "ingredient", id: context.ingredientId };
  if (context.recipeId) return { type: "recipe", id: context.recipeId };
  if (context.recipeGroupId)
    return { type: "recipe group", id: context.recipeGroupId };
  if (context.conversationId)
    return { type: "conversation", id: context.conversationId };
  return null;
}

/**
 * Generates a human-readable description of the page context for the AI
 */
export function describePageContext(context: PageContext): string {
  const { section, viewType } = context;
  const entity = getCurrentEntity(context);

  if (section === "dashboard" && viewType === "list") {
    return "The user is on the main dashboard.";
  }

  const sectionLabels: Record<PageSection, string> = {
    dashboard: "dashboard",
    recipes: "recipes",
    ingredients: "ingredients",
    "recipe-groups": "recipe groups",
    chat: "chat",
  };

  const sectionLabel = sectionLabels[section];

  switch (viewType) {
    case "list":
      return `The user is viewing the list of all ${sectionLabel}.`;
    case "view":
      if (entity) {
        return `The user is viewing a specific ${entity.type} (ID: ${entity.id}). They may want information about this specific item.`;
      }
      return `The user is viewing a ${sectionLabel.replace(/s$/, "")}.`;
    case "edit":
      if (entity) {
        return `The user is editing a ${entity.type} (ID: ${entity.id}). They may need help with changes.`;
      }
      return `The user is editing a ${sectionLabel.replace(/s$/, "")}.`;
    case "add":
      return `The user is creating a new ${sectionLabel.replace(/s$/, "")}. They may need suggestions or help filling in details.`;
    default:
      return `The user is in the ${sectionLabel} section.`;
  }
}

