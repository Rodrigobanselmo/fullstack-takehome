import type { UserSession } from "~/lib/auth";

export const canViewChat = (user: UserSession | null) => {
  return !!user;
};

export const canSendMessage = (user: UserSession | null) => {
  return !!user;
};
