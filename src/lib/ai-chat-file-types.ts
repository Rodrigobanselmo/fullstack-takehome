/**
 * Supported file types for AI chat multimodal messages
 * This file is safe to import on client or server
 *
 * Gemini supports: images, videos, audio, PDFs, spreadsheets
 * OpenAI supports: images only
 * Server-parsed: Excel, DOCX (converted to text before sending to LLM)
 */
export const AI_CHAT_SUPPORTED_TYPES = {
  // Images (both Gemini and OpenAI)
  image: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
  ],
  // Videos (Gemini only)
  video: [
    "video/mp4",
    "video/mpeg",
    "video/mov",
    "video/quicktime",
    "video/avi",
    "video/x-msvideo",
    "video/webm",
    "video/mkv",
    "video/x-matroska",
  ],
  // Audio (Gemini only)
  audio: [
    "audio/mp3",
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/aac",
    "audio/flac",
    "audio/ogg",
    "audio/webm",
    "audio/m4a",
    "audio/x-m4a",
  ],
  // Documents (PDF native, DOCX parsed server-side)
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  // Plain text files
  text: ["text/plain"],
  // Spreadsheets (CSV native, Excel parsed server-side)
  spreadsheet: [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
} as const;

export type AIChatFileType = keyof typeof AI_CHAT_SUPPORTED_TYPES;

/**
 * Get all supported MIME types for AI chat
 */
export function getAllAIChatSupportedTypes(): string[] {
  return Object.values(AI_CHAT_SUPPORTED_TYPES).flat();
}

/**
 * Get the file type category from MIME type
 */
export function getAIChatFileType(mimeType: string): AIChatFileType | null {
  for (const [type, mimes] of Object.entries(AI_CHAT_SUPPORTED_TYPES)) {
    if ((mimes as readonly string[]).includes(mimeType)) {
      return type as AIChatFileType;
    }
  }
  return null;
}

/**
 * Validate if a MIME type is supported for AI chat
 */
export function validateAIChatFileType(mimeType: string): boolean {
  return getAllAIChatSupportedTypes().includes(mimeType);
}

