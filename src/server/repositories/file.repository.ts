import type { File } from "generated/gql/graphql";
import { getPrismaClient } from "~/server/database/transaction";

// Scalar entity without nested relations (includes uploaderId for loading uploader)
// Omit 'url' because it's computed dynamically in the resolver
export type FileEntity = Omit<File, "uploader" | "url">;

export interface CreateFileData {
  key: string;
  bucket: string;
  region: string;
  filename: string;
  mimeType: string;
  size: number;
  uploaderId: string;
}

class PrismaFileRepository {
  async create(data: CreateFileData): Promise<FileEntity> {
    const db = getPrismaClient();
    const file = await db.files.create({
      data,
    });

    return {
      id: file.id,
      key: file.key,
      bucket: file.bucket,
      region: file.region,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      uploaderId: file.uploaderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  async findById({ fileId }: { fileId: string }): Promise<FileEntity | null> {
    const db = getPrismaClient();
    const file = await db.files.findFirst({
      where: {
        id: fileId,
        deletedAt: null,
      },
    });

    if (!file) {
      return null;
    }

    return {
      id: file.id,
      key: file.key,
      bucket: file.bucket,
      region: file.region,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      uploaderId: file.uploaderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  async findByKey({ key }: { key: string }): Promise<FileEntity | null> {
    const db = getPrismaClient();
    const file = await db.files.findFirst({
      where: {
        key,
        deletedAt: null,
      },
    });

    if (!file) {
      return null;
    }

    return {
      id: file.id,
      key: file.key,
      bucket: file.bucket,
      region: file.region,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      uploaderId: file.uploaderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  async softDelete({ fileId }: { fileId: string }): Promise<FileEntity> {
    const db = getPrismaClient();
    const file = await db.files.update({
      where: { id: fileId },
      data: { deletedAt: new Date() },
    });

    return {
      id: file.id,
      key: file.key,
      bucket: file.bucket,
      region: file.region,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      uploaderId: file.uploaderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  async updateMetadata(
    fileId: string,
    metadata: Record<string, unknown>,
  ): Promise<FileEntity> {
    const db = getPrismaClient();
    const file = await db.files.update({
      where: { id: fileId },
      data: {
        metadata: metadata as object,
        updatedAt: new Date(),
      },
    });

    return {
      id: file.id,
      key: file.key,
      bucket: file.bucket,
      region: file.region,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      uploaderId: file.uploaderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }
}

export const fileRepository = new PrismaFileRepository();
