import type { UserSession } from "~/lib/auth";

export const canViewRecipes = (user: UserSession | null) => {
  return !!user;
};

export const canManageRecipes = (user: UserSession | null) => {
  return !!user;
};
