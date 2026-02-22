import { FileUploadType } from "generated/gql/graphql";
import { z } from "zod";

export const fileUploadTypeSchema = z.enum(FileUploadType);

export const uploadFileInputSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  type: fileUploadTypeSchema,
  size: z.number().int().positive().optional(),
});

