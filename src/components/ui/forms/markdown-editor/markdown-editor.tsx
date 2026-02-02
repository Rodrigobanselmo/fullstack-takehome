"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./markdown-editor.module.css";

interface MarkdownEditorProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type ViewMode = "write" | "preview";

export default function MarkdownEditor({
  label,
  name,
  value,
  onChange,
  placeholder = "Write your instructions here...\n\n# Example\n\n1. First step\n2. Second step\n\n**Bold** and *italic* text supported.",
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<ViewMode>("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(
        selectedText ? newCursorPos : start + before.length,
        selectedText ? newCursorPos : start + before.length
      );
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastLineStart = textBeforeCursor.lastIndexOf("\n") + 1;
    const currentLine = textBeforeCursor.substring(lastLineStart);

    // Check for numbered list with optional indentation (e.g., "  1. ", "    2. ")
    const numberedMatch = /^(\s*)(\d+)\.\s/.exec(currentLine);
    if (numberedMatch?.[2]) {
      const indent = numberedMatch[1] ?? "";
      const currentNumber = parseInt(numberedMatch[2], 10);
      // If line only has the list marker (empty item), remove it
      if (currentLine.trim() === `${currentNumber}.`) {
        e.preventDefault();
        const newText = value.substring(0, lastLineStart) + value.substring(cursorPos);
        onChange(newText);
        setTimeout(() => {
          textarea.setSelectionRange(lastLineStart, lastLineStart);
        }, 0);
        return;
      }
      e.preventDefault();
      const nextNumber = currentNumber + 1;
      const insertion = `\n${indent}${nextNumber}. `;
      const newText = value.substring(0, cursorPos) + insertion + value.substring(cursorPos);
      onChange(newText);
      setTimeout(() => {
        const newPos = cursorPos + insertion.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
      return;
    }

    // Check for bullet list with optional indentation (e.g., "  - " or "    * ")
    const bulletMatch = /^(\s*)([-*])\s/.exec(currentLine);
    if (bulletMatch?.[2]) {
      const indent = bulletMatch[1] ?? "";
      const bullet = bulletMatch[2];
      // If line only has the bullet (empty item), remove it
      if (currentLine.trim() === bullet) {
        e.preventDefault();
        const newText = value.substring(0, lastLineStart) + value.substring(cursorPos);
        onChange(newText);
        setTimeout(() => {
          textarea.setSelectionRange(lastLineStart, lastLineStart);
        }, 0);
        return;
      }
      e.preventDefault();
      const insertion = `\n${indent}${bullet} `;
      const newText = value.substring(0, cursorPos) + insertion + value.substring(cursorPos);
      onChange(newText);
      setTimeout(() => {
        const newPos = cursorPos + insertion.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
      return;
    }
  };

  const toolbarActions = [
    { icon: "B", title: "Bold", action: () => insertText("**", "**") },
    { icon: "I", title: "Italic", action: () => insertText("*", "*") },
    { icon: "H1", title: "Heading 1", action: () => insertText("\n# ", "\n") },
    { icon: "H2", title: "Heading 2", action: () => insertText("\n## ", "\n") },
    { icon: "H3", title: "Heading 3", action: () => insertText("\n### ", "\n") },
    { divider: true },
    { icon: "•", title: "Bullet List", action: () => insertText("\n- ", "\n") },
    { icon: "1.", title: "Numbered List", action: () => insertText("\n1. ", "\n") },
    { icon: ">", title: "Quote", action: () => insertText("\n> ", "\n") },
    { icon: "</>", title: "Code", action: () => insertText("`", "`") },
    { icon: "—", title: "Divider", action: () => insertText("\n\n---\n\n", "") },
  ];

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.editorWrapper}>
        <div className={styles.toolbar}>
          {toolbarActions.map((item, index) =>
            item.divider ? (
              <div key={index} className={styles.toolbarDivider} />
            ) : (
              <button
                key={index}
                type="button"
                className={styles.toolbarButton}
                onClick={item.action}
                title={item.title}
              >
                {item.icon}
              </button>
            )
          )}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${mode === "write" ? styles.tabActive : ""}`}
              onClick={() => setMode("write")}
            >
              Write
            </button>
            <button
              type="button"
              className={`${styles.tab} ${mode === "preview" ? styles.tabActive : ""}`}
              onClick={() => setMode("preview")}
            >
              Preview
            </button>
          </div>
        </div>
        <div className={styles.content}>
          {mode === "write" ? (
            <textarea
              ref={textareaRef}
              id={name}
              name={name}
              className={styles.textarea}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
            />
          ) : (
            <div className={styles.preview}>
              {value ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              ) : (
                <p className={styles.emptyPreview}>Nothing to preview yet...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

