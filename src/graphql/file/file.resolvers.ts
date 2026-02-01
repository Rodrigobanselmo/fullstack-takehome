import type { GraphQLContext } from "../context";
import type { FileEntity } from "~/server/repositories/file.repository";
import type { User } from "generated/gql/graphql";
import { getPresignedDownloadUrl } from "~/lib/s3";

export const fileResolvers = {
  File: {
    url: async (parent: FileEntity): Promise<string> => {
      // Generate presigned URL that expires in 1 hour
      return await getPresignedDownloadUrl(
        {
          key: parent.key,
          bucket: parent.bucket,
          region: parent.region,
        },
        3600, // 1 hour expiry
      );
    },

    uploader: async (
      parent: FileEntity,
      _args: unknown,
      context: GraphQLContext,
    ): Promise<User | null> => {
      return context.dataloaders.userById.load(parent.uploaderId);
    },
  },
};

