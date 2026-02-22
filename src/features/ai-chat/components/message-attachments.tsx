"use client";

import { useState, useCallback } from "react";
import { FileText, X } from "lucide-react";
import Image from "next/image";
import { type ChatMessageAttachment } from "../hooks/use-ai-chat-stream";
import styles from "./message-attachments.module.css";

// Re-export for convenience
export type { ChatMessageAttachment as MessageAttachment };

interface MessageAttachmentsProps {
  files: ChatMessageAttachment[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function isPdfMimeType(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export function MessageAttachments({ files }: MessageAttachmentsProps) {
  const [previewFile, setPreviewFile] = useState<ChatMessageAttachment | null>(
    null,
  );

  const openPreview = useCallback((file: ChatMessageAttachment) => {
    if (file.url) {
      setPreviewFile(file);
    }
  }, []);

  const closePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  if (files.length === 0) return null;

  return (
    <>
      <div className={styles.container}>
        {files.map((file) => {
          const isImage = isImageMimeType(file.mimeType);
          const isPdf = isPdfMimeType(file.mimeType);

          if (isImage && file.url) {
            return (
              <div
                key={file.id}
                className={`${styles.attachment} ${styles.imageAttachment}`}
                onClick={() => openPreview(file)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openPreview(file)}
                title={file.filename}
              >
                <Image
                  src={file.url}
                  alt={file.filename}
                  width={200}
                  height={200}
                  className={styles.imagePreview}
                  unoptimized
                />
              </div>
            );
          }

          return (
            <div
              key={file.id}
              className={`${styles.attachment} ${styles.documentAttachment}`}
              onClick={() => openPreview(file)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openPreview(file)}
              title={`Click to ${isPdf ? "view" : "download"} ${file.filename}`}
            >
              <FileText size={24} className={styles.documentIcon} />
              <div className={styles.documentInfo}>
                <span className={styles.documentFilename}>{file.filename}</span>
                <span className={styles.documentMeta}>
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewFile?.url && (
        <div className={styles.modal} onClick={closePreview}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={closePreview}
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
            {isImageMimeType(previewFile.mimeType) ? (
              <Image
                src={previewFile.url}
                alt={previewFile.filename}
                width={1200}
                height={800}
                className={styles.modalImage}
                unoptimized
              />
            ) : isPdfMimeType(previewFile.mimeType) ? (
              <iframe
                src={previewFile.url}
                title={previewFile.filename}
                className={styles.modalPdf}
              />
            ) : (
              <a href={previewFile.url} download={previewFile.filename}>
                Download {previewFile.filename}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

