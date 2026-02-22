"use client";

import {
  X,
  FileText,
  Music,
  Film,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import Image from "next/image";
import { type PendingAttachment } from "../hooks/use-file-attachments";
import styles from "./attachment-preview.module.css";

interface AttachmentPreviewProps {
  attachments: PendingAttachment[];
  onRemove: (localId: string) => void;
}

export function AttachmentPreview({
  attachments,
  onRemove,
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={styles.container}>
      {attachments.map((att) => (
        <div key={att.localId} className={styles.attachment}>
          {/* Thumbnail/Icon */}
          <div className={styles.thumbnail}>
            {att.type === "image" && att.previewUrl ? (
              <Image
                src={att.previewUrl}
                alt={att.filename}
                fill
                className={styles.thumbnailImage}
              />
            ) : att.type === "video" ? (
              <Film size={24} className={styles.thumbnailIcon} />
            ) : att.type === "audio" ? (
              <Music size={24} className={styles.thumbnailIcon} />
            ) : att.type === "spreadsheet" ? (
              <FileSpreadsheet size={24} className={styles.thumbnailIcon} />
            ) : (
              <FileText size={24} className={styles.thumbnailIcon} />
            )}

            {/* Upload status overlay */}
            {att.uploadStatus === "uploading" && (
              <div className={styles.uploadingOverlay}>
                <Loader2 size={20} className={styles.spinner} />
              </div>
            )}
            {att.uploadStatus === "error" && (
              <div className={styles.errorOverlay}>
                <AlertCircle size={20} />
              </div>
            )}
          </div>

          {/* Filename */}
          <span className={styles.filename} title={att.filename}>
            {truncateFilename(att.filename, 15)}
          </span>

          {/* Remove button */}
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemove(att.localId)}
            title="Remove"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function truncateFilename(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  const ext = name.split(".").pop() || "";
  const base = name.slice(0, name.length - ext.length - 1);
  const truncatedBase = base.slice(0, maxLength - ext.length - 4) + "...";
  return `${truncatedBase}.${ext}`;
}

