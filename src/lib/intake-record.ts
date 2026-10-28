import type { IntakeFormValues } from "@/lib/validations/intake";

export type IntakeRecordDog = {
  id: string;
  name: string;
  breed: string | null;
  intakeData: unknown;
};

export type IntakeRecordClient = {
  name: string;
  email: string;
  phone: string | null;
};

export type IntakeRecordDefaults = {
  dogId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  meetingType: "virtual" | "in_person";
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  dogName: string;
  breed: string;
  ageYears: string;
  ageMonths: string;
  sex: "male" | "female" | "unknown";
  neutered: boolean;
  dogJob: string;
  dummyWork: string;
  whistle: string;
  steadyBirds: string;
  steadyDogs: string;
  steadyShot: string;
  hasGround: string;
  groundNotes: string;
  fearTriggers: string;
  aggressionNotes: string;
  previousTraining: string;
  extraNotes: string;
  goals: string;
  trainerNotes: string;
};

function recordOf(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }
  return data as Record<string, unknown>;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function choice(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function intakeRecordDefaults(dog: IntakeRecordDog, client: IntakeRecordClient): IntakeRecordDefaults {
  const data = recordOf(dog.intakeData);
  const sex = data.sex === "male" || data.sex === "female" || data.sex === "unknown" ? data.sex : "unknown";
  const ageYears = typeof data.ageYears === "number" && Number.isFinite(data.ageYears) ? data.ageYears : 0;
  const ageMonths =
    typeof data.ageMonths === "number" && Number.isFinite(data.ageMonths) ? String(data.ageMonths) : "";

  return {
    dogId: dog.id,
    ownerName: text(data.ownerName) || client.name,
    ownerEmail: text(data.ownerEmail) || client.email,
    ownerPhone: text(data.ownerPhone) || client.phone || "",
    meetingType: data.meetingType === "in_person" ? "in_person" : "virtual",
    addressLine1: text(data.addressLine1),
    addressLine2: text(data.addressLine2),
    city: text(data.city),
    postcode: text(data.postcode),
    dogName: text(data.dogName) || dog.name,
    breed: text(data.breed) || dog.breed || "",
    ageYears: String(ageYears),
    ageMonths,
    sex,
    neutered: data.neutered === true,
    dogJob: choice(data.dogJob),
    dummyWork: choice(data.dummyWork),
    whistle: choice(data.whistle),
    steadyBirds: choice(data.steadyBirds),
    steadyDogs: choice(data.steadyDogs),
    steadyShot: choice(data.steadyShot),
    hasGround: choice(data.hasGround),
    groundNotes: text(data.groundNotes),
    fearTriggers: text(data.fearTriggers),
    aggressionNotes: text(data.aggressionNotes),
    previousTraining: text(data.previousTraining),
    extraNotes: text(data.extraNotes),
    goals: text(data.goals),
    trainerNotes: text(data.trainerNotes),
  };
}

export function consentedAtFromIntake(data: unknown, fallbackIso: string) {
  const record = recordOf(data);
  return typeof record.consentedAt === "string" && record.consentedAt ? record.consentedAt : fallbackIso;
}

export function intakePdfValues(
  defaults: IntakeRecordDefaults,
): IntakeFormValues {
  const ageYears = Number(defaults.ageYears) || 0;
  const ageMonths = defaults.ageMonths ? Number(defaults.ageMonths) : undefined;
  return {
    ownerName: defaults.ownerName,
    ownerEmail: defaults.ownerEmail,
    ownerPhone: defaults.ownerPhone,
    meetingType: defaults.meetingType,
    addressLine1: defaults.addressLine1,
    addressLine2: defaults.addressLine2,
    city: defaults.city,
    postcode: defaults.postcode,
    dogName: defaults.dogName,
    breed: defaults.breed,
    ageYears,
    ageMonths,
    sex: defaults.sex,
    neutered: defaults.neutered,
    dogJob: defaults.dogJob as IntakeFormValues["dogJob"],
    dummyWork: defaults.dummyWork as IntakeFormValues["dummyWork"],
    whistle: defaults.whistle as IntakeFormValues["whistle"],
    steadyBirds: defaults.steadyBirds as IntakeFormValues["steadyBirds"],
    steadyDogs: defaults.steadyDogs as IntakeFormValues["steadyDogs"],
    steadyShot: defaults.steadyShot as IntakeFormValues["steadyShot"],
    hasGround: defaults.hasGround as IntakeFormValues["hasGround"],
    groundNotes: defaults.groundNotes,
    fearTriggers: defaults.fearTriggers,
    aggressionNotes: defaults.aggressionNotes,
    previousTraining: defaults.previousTraining,
    extraNotes: defaults.extraNotes,
    goals: defaults.goals,
    consentDataStorage: true,
  };
}
