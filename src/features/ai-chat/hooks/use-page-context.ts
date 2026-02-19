"use client";

import { usePathname, useParams } from "next/navigation";
import { useMemo } from "react";
import {
  createPageContext,
  type PageContext,
  type RouteParams,
} from "~/lib/ai-types";

/**
 * Hook that tracks the current page context based on URL and route params.
 * Uses Next.js useParams() to get named route parameters directly.
 * Updates automatically when the user navigates to a different page.
 *
 * @returns The current PageContext object with specific entity IDs
 */
export function usePageContext(): PageContext {
  const pathname = usePathname();
  const rawParams = useParams();

  const pageContext = useMemo(() => {
    // Convert params to RouteParams (handle string | string[] | undefined)
    const params: RouteParams = {
      recipeId:
        typeof rawParams.recipeId === "string" ? rawParams.recipeId : undefined,
      ingredientId:
        typeof rawParams.ingredientId === "string"
          ? rawParams.ingredientId
          : undefined,
      recipeGroupId:
        typeof rawParams.recipeGroupId === "string"
          ? rawParams.recipeGroupId
          : undefined,
      conversationId:
        typeof rawParams.conversationId === "string"
          ? rawParams.conversationId
          : undefined,
    };

    return createPageContext({
      pathname: pathname ?? "/",
      params,
    });
  }, [pathname, rawParams]);

  return pageContext;
}

