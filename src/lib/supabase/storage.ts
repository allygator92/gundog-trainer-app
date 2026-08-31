import { createServiceRoleClient } from "@/lib/supabase/server";

export const CLIENT_DOCUMENTS_BUCKET = "client-documents";
const SIGNED_URL_SECONDS = 10 * 60;

async function getStorage() {
  const supabase = await createServiceRoleClient();
  return supabase.storage;
}

export async function ensureClientDocumentsBucket() {
  const storage = await getStorage();
  const { data: buckets } = await storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === CLIENT_DOCUMENTS_BUCKET);
  if (exists) {
    return;
  }

  const { error } = await storage.createBucket(CLIENT_DOCUMENTS_BUCKET, {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Could not create storage bucket: ${error.message}`);
  }
}

export async function uploadPrivatePdf(path: string, body: Buffer) {
  await ensureClientDocumentsBucket();
  const storage = await getStorage();
  const { error } = await storage.from(CLIENT_DOCUMENTS_BUCKET).upload(path, body, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (error) {
    throw new Error(`Could not upload PDF: ${error.message}`);
  }
}

export async function createPrivatePdfSignedUrl(path: string) {
  const storage = await getStorage();
  const { data, error } = await storage
    .from(CLIENT_DOCUMENTS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(`Could not create download link: ${error?.message ?? "unknown error"}`);
  }

  return data.signedUrl;
}
