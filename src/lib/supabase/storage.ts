import { createServiceRoleClient } from "@/lib/supabase/server";

export const CLIENT_DOCUMENTS_BUCKET = "client-documents";
export const SIGNED_URL_SECONDS = 10 * 60;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedDocumentMime = (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

async function getStorage() {
  const supabase = await createServiceRoleClient();
  return supabase.storage;
}

export function isAllowedDocumentMime(value: string): value is AllowedDocumentMime {
  return (ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(value);
}

export function extensionForMime(mime: AllowedDocumentMime) {
  if (mime === "application/pdf") {
    return "pdf";
  }
  if (mime === "image/jpeg") {
    return "jpg";
  }
  if (mime === "image/png") {
    return "png";
  }
  return "webp";
}

export function safeDocumentFilename(name: string) {
  const trimmed = name.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  return trimmed.slice(0, 80) || "document";
}

async function ensureClientDocumentsBucket() {
  const storage = await getStorage();
  const { data: buckets } = await storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === CLIENT_DOCUMENTS_BUCKET);
  const options = {
    public: false,
    fileSizeLimit: MAX_DOCUMENT_BYTES,
    allowedMimeTypes: [...ALLOWED_DOCUMENT_MIME_TYPES],
  };

  if (exists) {
    const { error } = await storage.updateBucket(CLIENT_DOCUMENTS_BUCKET, options);
    if (error) {
      console.warn("Could not update storage bucket options:", error.message);
    }
    return;
  }

  const { error } = await storage.createBucket(CLIENT_DOCUMENTS_BUCKET, options);

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Could not create storage bucket: ${error.message}`);
  }
}

export async function uploadPrivatePdf(path: string, body: Buffer) {
  await uploadPrivateFile(path, body, "application/pdf");
}

export async function uploadPrivateFile(path: string, body: Buffer, contentType: AllowedDocumentMime) {
  await ensureClientDocumentsBucket();
  const storage = await getStorage();
  const { error } = await storage.from(CLIENT_DOCUMENTS_BUCKET).upload(path, body, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Could not upload file: ${error.message}`);
  }
}

export async function createPrivatePdfSignedUrl(path: string) {
  return createPrivateFileSignedUrl(path);
}

export async function createPrivateFileSignedUrl(path: string) {
  const storage = await getStorage();
  const { data, error } = await storage
    .from(CLIENT_DOCUMENTS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(`Could not create download link: ${error?.message ?? "unknown error"}`);
  }

  return data.signedUrl;
}

export async function deletePrivateFiles(paths: string[]) {
  if (paths.length === 0) {
    return;
  }
  const storage = await getStorage();
  const { error } = await storage.from(CLIENT_DOCUMENTS_BUCKET).remove(paths);
  if (error) {
    throw new Error(`Could not delete files: ${error.message}`);
  }
}
