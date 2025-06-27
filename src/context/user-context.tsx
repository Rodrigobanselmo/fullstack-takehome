"use client";

import React, { createContext, useContext } from "react";
import type { UserSession } from "~/lib/auth";

const UserContext = createContext<UserSession | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: UserSession;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
