import { generateIntakePdf } from "@/lib/pdf/intake-document";
import { prisma } from "@/lib/prisma";
import { consentedAtFromIntake, intakePdfValues, intakeRecordDefaults } from "@/lib/intake-record";
import { replacePrivatePdf, uploadPrivatePdf } from "@/lib/supabase/storage";

export async function refreshIntakePdf(dogId: string) {
  const dog = await prisma.dog.findUnique({
    where: { id: dogId },
    include: { client: true },
  });

  if (!dog) {
    return { ok: false as const, error: "That dog could not be found." };
  }

  const defaults = intakeRecordDefaults(dog, dog.client);
  const pdf = await generateIntakePdf(
    intakePdfValues(defaults),
    consentedAtFromIntake(dog.intakeData, dog.createdAt.toISOString()),
    defaults.trainerNotes,
  );
  const filename = `${defaults.dogName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-intake.pdf`;
  const existing = await prisma.document.findFirst({
    where: {
      clientId: dog.clientId,
      type: "intake_pdf",
      storagePath: { contains: dog.id },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await replacePrivatePdf(existing.storagePath, pdf);
    await prisma.document.update({
      where: { id: existing.id },
      data: { filename },
    });
    return { ok: true as const };
  }

  const storagePath = `${dog.clientId}/${dog.id}-intake-${Date.now()}.pdf`;
  await uploadPrivatePdf(storagePath, pdf);
  await prisma.document.create({
    data: {
      clientId: dog.clientId,
      storagePath,
      filename,
      type: "intake_pdf",
    },
  });
  return { ok: true as const };
}
