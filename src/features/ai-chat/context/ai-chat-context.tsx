"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AIChatContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  currentThreadId: string | null;
  setCurrentThreadId: (id: string | null) => void;
  showThreadList: boolean;
  setShowThreadList: (show: boolean) => void;
  toggleThreadList: () => void;
}

const AIChatContext = createContext<AIChatContextValue | null>(null);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [showThreadList, setShowThreadList] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);
  const toggleThreadList = () => setShowThreadList((prev) => !prev);

  return (
    <AIChatContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        currentThreadId,
        setCurrentThreadId,
        showThreadList,
        setShowThreadList,
        toggleThreadList,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error("useAIChat must be used within an AIChatProvider");
  }
  return context;
}

