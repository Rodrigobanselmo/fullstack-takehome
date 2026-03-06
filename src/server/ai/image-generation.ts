import { GoogleGenAI } from "@google/genai";
import { env } from "~/config/env";
import { uploadFileToS3 } from "~/lib/s3";
import { fileRepository } from "~/server/repositories/file.repository";

// Imagen 4 model configuration
const IMAGEN_MODEL = "imagen-4.0-generate-001";

// Image generation configuration
export interface ImageGenerationConfig {
  numberOfImages?: number;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export interface GeneratedImage {
  imageBytes: Buffer;
  mimeType: string;
}

export interface ImageGenerationResult {
  success: boolean;
  images?: GeneratedImage[];
  error?: string;
}

/**
 * Get or create the Google GenAI client (singleton)
 */
let genaiClient: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI {
  if (!genaiClient) {
    if (!env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured for image generation");
    }
    genaiClient = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });
  }
  return genaiClient;
}

/**
 * Generate images using Google Imagen 4
 */
export async function generateImages(
  prompt: string,
  config: ImageGenerationConfig = {},
): Promise<ImageGenerationResult> {
  try {
    const client = getGenAIClient();
    const { numberOfImages = 1, aspectRatio = "4:3" } = config;

    console.log(
      `[ImageGen] Generating ${numberOfImages} image(s) with prompt: "${prompt.substring(0, 50)}..."`,
    );

    const response = await client.models.generateImages({
      model: IMAGEN_MODEL,
      prompt,
      config: {
        numberOfImages,
        aspectRatio,
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      return {
        success: false,
        error: "No images were generated",
      };
    }

    const images: GeneratedImage[] = response.generatedImages.map((img) => ({
      imageBytes: Buffer.from(img.image?.imageBytes || "", "base64"),
      mimeType: "image/png",
    }));

    console.log(`[ImageGen] Successfully generated ${images.length} image(s)`);

    return {
      success: true,
      images,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[ImageGen] Error generating images: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generate an image and upload it to S3, returning the file entity
 */
export async function generateAndUploadImage(
  prompt: string,
  userId: string,
  folder = "ai-generated-images",
): Promise<{ fileId: string } | null> {
  const result = await generateImages(prompt, {
    numberOfImages: 1,
    aspectRatio: "4:3",
  });

  if (!result.success || !result.images || result.images.length === 0) {
    console.error(`[ImageGen] Failed to generate image: ${result.error}`);
    return null;
  }

  const image = result.images[0];
  if (!image) {
    console.error(`[ImageGen] No image in result`);
    return null;
  }

  const filename = `recipe-${Date.now()}.png`;

  try {
    // Upload to S3
    const uploadResult = await uploadFileToS3({
      file: image.imageBytes,
      filename,
      mimeType: image.mimeType,
      folder,
    });

    // Create file record in database
    const file = await fileRepository.create({
      key: uploadResult.key,
      bucket: env.AWS_S3_BUCKET,
      region: env.AWS_REGION,
      filename,
      mimeType: image.mimeType,
      size: image.imageBytes.length,
      uploaderId: userId,
    });

    console.log(`[ImageGen] Image uploaded successfully: ${file.id}`);

    return { fileId: file.id };
  } catch (error) {
    console.error(
      `[ImageGen] Failed to upload image:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
