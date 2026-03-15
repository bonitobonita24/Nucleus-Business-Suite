// ─────────────────────────────────────────────────────────────────────────────
// @nucleus/storage — S3-Compatible Storage Client
// Dev: MinIO (port 9001) | Prod: Cloudflare R2
// Single shared bucket; tenant isolation via path prefix (D014 — LOCKED)
//
// Upload paths:
//   <tenant_slug>/receipts/goods-receipt/<id>/<filename>
//   <tenant_slug>/receipts/shipping-cost/<id>/<filename>
//   <tenant_slug>/receipts/expense/<id>/<filename>
//   <tenant_slug>/receipts/cash-advance/<id>/<filename>
//   <tenant_slug>/receipts/credit-card-payment/<id>/<filename>
//   <tenant_slug>/receipts/credit-refund/<id>/<filename>
//   <tenant_slug>/documents/proposals/<id>/<filename>
//   <tenant_slug>/tickets/<id>/<filename>
// ─────────────────────────────────────────────────────────────────────────────

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── Config ───────────────────────────────────────────────────────────────────

export interface StorageConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
  /** true for MinIO dev, false for Cloudflare R2 */
  forcePathStyle: boolean;
}

function getStorageConfig(): StorageConfig {
  return {
    endpoint: process.env["STORAGE_ENDPOINT"] ?? "http://localhost:9000",
    region: process.env["STORAGE_REGION"] ?? "us-east-1",
    accessKeyId: process.env["STORAGE_ACCESS_KEY"] ?? "minioadmin",
    secretAccessKey: process.env["STORAGE_SECRET_KEY"] ?? "minioadmin",
    bucket: process.env["STORAGE_BUCKET"] ?? "nucleus-dev",
    publicUrl: process.env["STORAGE_PUBLIC_URL"] ?? "http://localhost:9000/nucleus-dev",
    forcePathStyle: process.env["NODE_ENV"] !== "production",
  };
}

// ─── Client Singleton ─────────────────────────────────────────────────────────

let _client: S3Client | null = null;
let _config: StorageConfig | null = null;

export function getStorageClient(): { client: S3Client; config: StorageConfig } {
  if (!_client || !_config) {
    _config = getStorageConfig();
    _client = new S3Client({
      endpoint: _config.endpoint,
      region: _config.region,
      credentials: {
        accessKeyId: _config.accessKeyId,
        secretAccessKey: _config.secretAccessKey,
      },
      forcePathStyle: _config.forcePathStyle,
    });
  }
  return { client: _client, config: _config };
}

// ─── Upload Path Builders ─────────────────────────────────────────────────────

export type UploadCategory =
  | "receipts/goods-receipt"
  | "receipts/shipping-cost"
  | "receipts/expense"
  | "receipts/cash-advance"
  | "receipts/credit-card-payment"
  | "receipts/credit-refund"
  | "documents/proposals"
  | "tickets";

export function buildUploadPath(
  tenantSlug: string,
  category: UploadCategory,
  id: string,
  filename: string,
): string {
  // Sanitize filename to prevent path traversal
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${tenantSlug}/${category}/${id}/${safeFilename}`;
}

// ─── Allowed File Types ───────────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(mimeType: string, sizeBytes: number): void {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
    throw new Error(
      `File type not allowed: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
    );
  }
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File too large: ${sizeBytes} bytes. Max: ${MAX_FILE_SIZE_BYTES} bytes (10MB)`);
  }
}

// ─── Upload Operations ────────────────────────────────────────────────────────

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload a file directly to storage.
 * Used for server-side uploads (PDFs, reports).
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<UploadResult> {
  const { client, config } = getStorageClient();

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return {
    key,
    url: `${config.publicUrl}/${key}`,
  };
}

/**
 * Generate a pre-signed URL for client-side upload.
 * Used for mobile expense receipt uploads (D014 — pre-signed URL mechanism).
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: AllowedMimeType,
  expiresInSeconds = 900, // 15 minutes
): Promise<string> {
  const { client, config } = getStorageClient();

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a pre-signed URL for downloading a private file.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600, // 1 hour
): Promise<string> {
  const { client, config } = getStorageClient();

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(key: string): Promise<void> {
  const { client, config } = getStorageClient();

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}

/**
 * Check if a file exists in storage.
 */
export async function fileExists(key: string): Promise<boolean> {
  const { client, config } = getStorageClient();

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
