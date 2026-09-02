import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createPrivateFileSignedUrl } from "@/lib/supabase/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await context.params;
  const document = await prisma.document.findUnique({
    where: { id },
    select: { storagePath: true },
  });

  if (!document) {
    notFound();
  }

  const signedUrl = await createPrivateFileSignedUrl(document.storagePath);
  redirect(signedUrl);
}
