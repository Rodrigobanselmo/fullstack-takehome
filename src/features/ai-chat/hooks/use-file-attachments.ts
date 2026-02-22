"use client";

import { useState, useCallback } from "react";
import { AI_CHAT_SUPPORTED_TYPES } from "~/lib/ai-chat-file-types";
import {
  useUploadFileMutation,
  uploadToS3,
  FileUploadType,
} from "~/features/files/api/use-upload-file-mutation";

export interface PendingAttachment {
  id: string; // File ID from server
  localId: string; // Local unique ID for tracking
  filename: string;
  mimeType: string;
  size: number;
  type: "image" | "video" | "audio" | "document";
  previewUrl?: string; // Local blob URL for preview
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export interface RejectedFile {
  filename: string;
  mimeType: string;
  reason: string;
}

export function useFileAttachments() {
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile] = useUploadFileMutation();

  const addFiles = useCallback(
    async (files: FileList | File[]): Promise<RejectedFile[]> => {
      const fileArray = Array.from(files);
      const rejected: RejectedFile[] = [];
      setIsUploading(true);

      for (const file of fileArray) {
        const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Create local preview URL for images
        const previewUrl = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;

        // Determine file type category
        const type = getFileType(file.type);
        if (!type) {
          rejected.push({
            filename: file.name,
            mimeType: file.type,
            reason: "Unsupported file type",
          });
          continue;
        }

        // Add pending attachment
        const pending: PendingAttachment = {
          id: "", // Will be set after server response
          localId,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          type,
          previewUrl,
          uploadStatus: "uploading",
        };

        setAttachments((prev) => [...prev, pending]);

        try {
          // Step 1: Get presigned URL from GraphQL mutation
          const { data, errors } = await uploadFile({
            variables: {
              input: {
                filename: file.name,
                mimeType: file.type,
                type: FileUploadType.AiChat,
              },
            },
          });

          if (errors?.length || !data?.uploadFile) {
            throw new Error(errors?.[0]?.message || "Upload failed");
          }

          const { file: fileData, presignedPost } = data.uploadFile;

          // Step 2: Upload to S3
          await uploadToS3(file, presignedPost);

          // Update attachment with server file ID
          setAttachments((prev) =>
            prev.map((att) =>
              att.localId === localId
                ? {
                    ...att,
                    id: fileData.id,
                    uploadStatus: "complete" as const,
                  }
                : att,
            ),
          );
        } catch (error) {
          console.error("Upload error:", error);
          setAttachments((prev) =>
            prev.map((att) =>
              att.localId === localId
                ? {
                    ...att,
                    uploadStatus: "error" as const,
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : att,
            ),
          );
        }
      }

      setIsUploading(false);
      return rejected;
    },
    [uploadFile],
  );

  const removeAttachment = useCallback((localId: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.localId === localId);
      // Revoke preview URL to free memory
      if (att?.previewUrl) {
        URL.revokeObjectURL(att.previewUrl);
      }
      return prev.filter((a) => a.localId !== localId);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    attachments.forEach((att) => {
      if (att.previewUrl) {
        URL.revokeObjectURL(att.previewUrl);
      }
    });
    setAttachments([]);
  }, [attachments]);

  const getUploadedFileIds = useCallback(() => {
    return attachments
      .filter((att) => att.uploadStatus === "complete" && att.id)
      .map((att) => att.id);
  }, [attachments]);

  return {
    attachments,
    isUploading,
    addFiles,
    removeAttachment,
    clearAttachments,
    getUploadedFileIds,
  };
}

function getFileType(
  mimeType: string,
): "image" | "video" | "audio" | "document" | null {
  if (AI_CHAT_SUPPORTED_TYPES.image.includes(mimeType as never)) return "image";
  if (AI_CHAT_SUPPORTED_TYPES.video.includes(mimeType as never)) return "video";
  if (AI_CHAT_SUPPORTED_TYPES.audio.includes(mimeType as never)) return "audio";
  if (AI_CHAT_SUPPORTED_TYPES.document.includes(mimeType as never))
    return "document";
  return null;
}

