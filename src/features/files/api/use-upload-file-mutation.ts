"use client";

import { gql, useMutation } from "@apollo/client";
import {
  FileUploadType,
  type UploadFileMutation,
  type UploadFileMutationVariables,
} from "generated/gql/graphql";

const UPLOAD_FILE_MUTATION = gql`
  mutation UploadFile($input: UploadFileInput!) {
    uploadFile(input: $input) {
      file {
        id
        key
        bucket
        region
        filename
        mimeType
        size
        createdAt
      }
      presignedPost {
        url
        fields
        key
      }
    }
  }
`;

export function useUploadFileMutation() {
  return useMutation<UploadFileMutation, UploadFileMutationVariables>(
    UPLOAD_FILE_MUTATION,
  );
}

export { FileUploadType };

/**
 * Upload a file to S3 using presigned POST
 */
export async function uploadToS3(
  file: File,
  presignedPost: { url: string; fields: string; key: string },
): Promise<void> {
  const fields = JSON.parse(presignedPost.fields) as Record<string, string>;

  const formData = new FormData();

  // Add all the fields from the presigned POST
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Add the file last
  formData.append("file", file);

  console.log("Uploading to S3:", {
    url: presignedPost.url,
    key: presignedPost.key,
    fileName: file.name,
    fileSize: file.size,
  });

  // Upload to S3
  const response = await fetch(presignedPost.url, {
    method: "POST",
    body: formData,
  });

  console.log("S3 upload response:", {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.error("S3 upload failed:", responseText);
    throw new Error(
      `Failed to upload file to S3: ${response.statusText}. ${responseText}`,
    );
  }

  console.log("✅ File successfully uploaded to S3");
}

