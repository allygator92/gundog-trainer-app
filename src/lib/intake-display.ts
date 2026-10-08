import { dogJobLabels, groundLabels, startedLabels, steadyLabels } from "@/lib/validations/intake";

const choiceLabels: Record<string, Record<string, string>> = {
  dogJob: dogJobLabels,
  dummyWork: startedLabels,
  whistle: startedLabels,
  steadyBirds: steadyLabels,
  steadyDogs: steadyLabels,
  steadyShot: steadyLabels,
  hasGround: groundLabels,
};

const labels: Record<string, string> = {
  ownerName: "Owner",
  ownerEmail: "Email",
  ownerPhone: "Phone",
  meetingType: "Session type",
  addressLine1: "Address",
  addressLine2: "Address line 2",
  city: "Town / city",
  postcode: "Postcode",
  dogName: "Dog",
  breed: "Breed",
  ageYears: "Age (years)",
  ageMonths: "Age (months)",
  sex: "Sex",
  neutered: "Neutered",
  dogJob: "Job",
  dummyWork: "Dummy work",
  whistle: "Whistle",
  steadyBirds: "Steady to birds",
  steadyDogs: "Steady to other dogs",
  steadyShot: "Steady to shot",
  hasGround: "Ground to work on",
  recall: "Recall",
  leadWalking: "Lead walking",
  fearTriggers: "Fear triggers",
  aggressionNotes: "Aggression notes",
  previousTraining: "Previous training",
  goals: "Goals",
  consentedAt: "Consent recorded",
};

const skip = new Set(["consentDataStorage", "botField", "existingDogId"]);

export function intakeRows(data: unknown): { label: string; value: string }[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  const rows: { label: string; value: string }[] = [];

  for (const [key, label] of Object.entries(labels)) {
    if (skip.has(key) || !(key in record)) {
      continue;
    }
    const raw = record[key];
    if (raw === null || raw === undefined || raw === "") {
      continue;
    }
    rows.push({ label, value: formatIntakeValue(key, raw) });
  }

  return rows;
}

function formatIntakeValue(key: string, raw: unknown): string {
  if (typeof raw === "boolean") {
    return raw ? "Yes" : "No";
  }
  if (key === "meetingType" && raw === "in_person") {
    return "In person";
  }
  if (key === "meetingType" && raw === "virtual") {
    return "Virtual";
  }
  const choices = choiceLabels[key];
  if (choices && typeof raw === "string" && raw in choices) {
    return choices[raw];
  }
  return String(raw);
}
