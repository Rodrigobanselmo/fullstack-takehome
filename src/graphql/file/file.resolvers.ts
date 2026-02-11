import type { GraphQLContext } from "../context";
import type { FileEntity } from "~/server/repositories/file.repository";
import type { User, MutationUploadFileArgs, FileUploadType } from "generated/gql/graphql";
import { getPresignedDownloadUrl } from "~/lib/s3";
import { uploadFilePresigned } from "./file.services";
import { uploadFileInputSchema } from "./file.validators";
import { schemaValidation } from "~/lib/validation";
import { InvalidInputError, UnauthorizedError } from "../errors";

export const fileResolvers = {
  File: {
    url: async (parent: FileEntity): Promise<string | null> => {
      // Generate presigned URL that expires in 1 hour
      try {
        return await getPresignedDownloadUrl(
          {
            key: parent.key,
            bucket: parent.bucket,
            region: parent.region,
          },
          3600, // 1 hour expiry
        );
      } catch (error) {
        console.error("Failed to generate presigned URL for file:", {
          fileId: parent.id,
          key: parent.key,
          bucket: parent.bucket,
          region: parent.region,
          filename: parent.filename,
          error: error instanceof Error ? error.message : String(error),
        });
        // Return null if file doesn't exist in S3 yet
        // This can happen if the file record was created but upload hasn't completed
        return null;
      }
    },

    uploader: async (
      parent: FileEntity,
      _args: unknown,
      context: GraphQLContext,
    ): Promise<User | null> => {
      return context.dataloaders.userById.load(parent.uploaderId);
    },
  },

  Mutation: {
    uploadFile: async (
      _: unknown,
      args: MutationUploadFileArgs,
      context: GraphQLContext,
    ) => {
      // Check if user is authenticated
      if (!context.user) {
        throw UnauthorizedError();
      }

      // Validate input
      const validation = schemaValidation(uploadFileInputSchema, args.input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      // Upload file and get presigned POST URL
      const result = await uploadFilePresigned({
        userId: context.user.id,
        filename: validation.data.filename,
        mimeType: validation.data.mimeType,
        type: validation.data.type as FileUploadType,
      });

      return {
        file: result.file,
        presignedPost: {
          url: result.presignedPost.url,
          fields: JSON.stringify(result.presignedPost.fields),
          key: result.presignedPost.key,
        },
      };
    },
  },
};
