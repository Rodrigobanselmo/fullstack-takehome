"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalEntry {
  id: string;
  component: ReactNode;
}

interface ModalContextValue {
  openModal: (component: ReactNode) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

let modalIdCounter = 0;

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalEntry[]>([]);

  const openModal = (component: ReactNode): string => {
    const id = `modal-${++modalIdCounter}`;
    setModals((prev) => [...prev, { id, component }]);
    return id;
  };

  const closeModal = (id?: string) => {
    setModals((prev) => {
      if (id) {
        return prev.filter((modal) => modal.id !== id);
      }
      // Close the topmost modal
      return prev.slice(0, -1);
    });
  };

  const closeAllModals = () => {
    setModals([]);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeAllModals }}>
      {children}
      {typeof window !== "undefined" &&
        modals.length > 0 &&
        createPortal(
          <div data-modal-root>
            {modals.map((modal, index) => (
              <ModalWrapper
                key={modal.id}
                id={modal.id}
                index={index}
                total={modals.length}
                onClose={() => closeModal(modal.id)}
              >
                {modal.component}
              </ModalWrapper>
            ))}
          </div>,
          document.body,
        )}
    </ModalContext.Provider>
  );
}

interface ModalWrapperProps {
  id: string;
  index: number;
  total: number;
  onClose: () => void;
  children: ReactNode;
}

function ModalWrapper({ index, total, onClose, children }: ModalWrapperProps) {
  const isTopmost = index === total - 1;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isTopmost) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isTopmost) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000 + index,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: `rgba(0, 0, 0, ${0.5 + index * 0.1})`,
        animation: "modalFadeIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          animation: "modalSlideIn 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
