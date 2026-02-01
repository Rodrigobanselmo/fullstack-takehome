import type { UserSession } from "~/lib/auth";

export const canViewIngredients = (user: UserSession | null) => {
  return !!user;
};

export const canManageIngredients = (user: UserSession | null) => {
  return !!user;
};

