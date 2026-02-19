"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// Panel width constraints
export const PANEL_MIN_WIDTH = 320;
export const PANEL_MAX_WIDTH = 600;
export const PANEL_DEFAULT_WIDTH = 400;

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
  panelWidth: number;
  setPanelWidth: (width: number) => void;
}

const AIChatContext = createContext<AIChatContextValue | null>(null);

const STORAGE_KEY = "ai-chat-panel-width";

export function AIChatProvider({ children }: { children: ReactNode }) {
  // Default to open
  const [isOpen, setIsOpen] = useState(true);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [showThreadList, setShowThreadList] = useState(false);
  const [panelWidth, setPanelWidthState] = useState(PANEL_DEFAULT_WIDTH);

  // Load saved width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem(STORAGE_KEY);
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= PANEL_MIN_WIDTH && width <= PANEL_MAX_WIDTH) {
        setPanelWidthState(width);
      }
    }
  }, []);

  const setPanelWidth = (width: number) => {
    const clampedWidth = Math.min(
      Math.max(width, PANEL_MIN_WIDTH),
      PANEL_MAX_WIDTH
    );
    setPanelWidthState(clampedWidth);
    localStorage.setItem(STORAGE_KEY, String(clampedWidth));
  };

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
        panelWidth,
        setPanelWidth,
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
