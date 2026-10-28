"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { consentedAtFromIntake } from "@/lib/intake-record";
import { refreshIntakePdf } from "@/lib/refresh-intake-pdf";
import { prisma } from "@/lib/prisma";
import { formatDogAge, formatIntakeAddress, trainerIntakeSchema } from "@/lib/validations/intake";

function returnPath(value: string, clientId: string) {
  const path = value.split("?")[0] ?? "";
  if (path === `/admin/clients/${clientId}`) {
    return path;
  }
  if (/^\/admin\/bookings\/[a-z0-9]+$/i.test(path)) {
    return path;
  }
  return `/admin/clients/${clientId}`;
}

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function updateDogIntakeAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = trainerIntakeSchema.safeParse({
    dogId: formValue(formData, "dogId"),
    ownerName: formValue(formData, "ownerName"),
    ownerEmail: formValue(formData, "ownerEmail"),
    ownerPhone: formValue(formData, "ownerPhone"),
    meetingType: formValue(formData, "meetingType"),
    addressLine1: formValue(formData, "addressLine1"),
    addressLine2: formValue(formData, "addressLine2"),
    city: formValue(formData, "city"),
    postcode: formValue(formData, "postcode"),
    dogName: formValue(formData, "dogName"),
    breed: formValue(formData, "breed"),
    ageYears: formValue(formData, "ageYears"),
    ageMonths: formValue(formData, "ageMonths"),
    sex: formValue(formData, "sex"),
    neutered: formValue(formData, "neutered") === "yes",
    dogJob: formValue(formData, "dogJob"),
    dummyWork: formValue(formData, "dummyWork"),
    whistle: formValue(formData, "whistle"),
    steadyBirds: formValue(formData, "steadyBirds"),
    steadyDogs: formValue(formData, "steadyDogs"),
    steadyShot: formValue(formData, "steadyShot"),
    hasGround: formValue(formData, "hasGround"),
    groundNotes: formValue(formData, "groundNotes"),
    fearTriggers: formValue(formData, "fearTriggers"),
    aggressionNotes: formValue(formData, "aggressionNotes"),
    previousTraining: formValue(formData, "previousTraining"),
    extraNotes: formValue(formData, "extraNotes"),
    goals: formValue(formData, "goals"),
    trainerNotes: formValue(formData, "trainerNotes"),
  });

  const dogId = formValue(formData, "dogId");
  const dog = dogId
    ? await prisma.dog.findUnique({
        where: { id: dogId },
        include: { client: true },
      })
    : null;
  const back = returnPath(formValue(formData, "returnTo"), dog?.clientId ?? "");

  if (!dog) {
    redirect(`/admin/clients?error=${encodeURIComponent("That dog could not be found.")}`);
  }

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the intake and try again.";
    redirect(`${back}?intakeDog=${dog.id}&intakeError=${encodeURIComponent(message)}`);
  }

  const emailOwner = await prisma.client.findFirst({
    where: {
      email: { equals: parsed.data.ownerEmail, mode: "insensitive" },
      NOT: { id: dog.clientId },
    },
  });
  if (emailOwner) {
    redirect(
      `${back}?intakeDog=${dog.id}&intakeError=${encodeURIComponent("Another client already uses that email.")}`,
    );
  }

  const { dogId: _dogId, trainerNotes, ...answers } = parsed.data;
  const consentedAt = consentedAtFromIntake(dog.intakeData, dog.createdAt.toISOString());
  const address =
    parsed.data.meetingType === "in_person" ? formatIntakeAddress(parsed.data) : null;

  await prisma.client.update({
    where: { id: dog.clientId },
    data: {
      name: parsed.data.ownerName,
      email: parsed.data.ownerEmail,
      phone: parsed.data.ownerPhone || null,
      address,
    },
  });

  await prisma.dog.update({
    where: { id: dog.id },
    data: {
      name: parsed.data.dogName,
      breed: parsed.data.breed,
      age: formatDogAge(parsed.data),
      behaviourNotes: parsed.data.goals,
      intakeData: {
        ...answers,
        trainerNotes,
        consentDataStorage: true,
        consentedAt,
      },
    },
  });

  try {
    await refreshIntakePdf(dog.id);
  } catch (error) {
    console.error("Could not refresh the intake PDF", error);
    redirect(
      `${back}?intakeDog=${dog.id}&intakeError=${encodeURIComponent("The intake was saved, but the PDF could not be refreshed.")}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/intakes");
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${dog.clientId}`);
  revalidatePath("/admin/bookings");
  revalidatePath(back);
  redirect(`${back}?intakeDog=${dog.id}&intakeSaved=1`);
}
