import type { UserSession } from "~/lib/auth";

export const canViewRecipeGroups = (user: UserSession | null) => {
  return !!user;
};

export const canManageRecipeGroups = (user: UserSession | null) => {
  return !!user;
};

