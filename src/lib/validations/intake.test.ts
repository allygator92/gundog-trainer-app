import { describe, expect, it } from "vitest";
import { formatIntakeAddress, intakeFormSchema, trainerIntakeSchema } from "@/lib/validations/intake";

const virtualIntake = {
  ownerName: "Sam Owner",
  ownerEmail: "sam@example.com",
  meetingType: "virtual" as const,
  dogName: "Moss",
  breed: "Labrador",
  ageYears: 3,
  sex: "male" as const,
  neutered: true,
  dogJob: "peg" as const,
  dummyWork: "started" as const,
  whistle: "started" as const,
  steadyBirds: "not_yet" as const,
  steadyDogs: "steady" as const,
  steadyShot: "not_sure" as const,
  hasGround: "paddock" as const,
  goals: "Steady at the peg, and a stop I can trust",
  consentDataStorage: true,
};

describe("intakeFormSchema", () => {
  it("accepts a non-gundog enquiry that does not need shot work", () => {
    const parsed = intakeFormSchema.parse({
      ...virtualIntake,
      dogJob: "non_gundog",
      steadyShot: "not_required",
      hasGround: "nowhere",
    });
    expect(parsed.dogJob).toBe("non_gundog");
    expect(parsed.steadyShot).toBe("not_required");
    expect(parsed.hasGround).toBe("nowhere");
  });

  it("accepts a virtual intake without an address", () => {
    const parsed = intakeFormSchema.parse(virtualIntake);
    expect(parsed.meetingType).toBe("virtual");
    expect(parsed.botField).toBeUndefined();
  });

  it("requires address details for in-person sessions", () => {
    const parsed = intakeFormSchema.safeParse({
      ...virtualIntake,
      meetingType: "in_person",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const paths = parsed.error.issues.map((issue) => issue.path[0]);
      expect(paths).toContain("addressLine1");
      expect(paths).toContain("city");
      expect(paths).toContain("postcode");
    }
  });

  it("accepts a UK postcode for in-person sessions", () => {
    const parsed = intakeFormSchema.parse({
      ...virtualIntake,
      meetingType: "in_person",
      addressLine1: "10 Field Lane",
      city: "York",
      postcode: "YO1 7HH",
    });
    expect(formatIntakeAddress(parsed)).toBe("10 Field Lane, York, YO1 7HH");
  });

  it("lets a returning client skip a new goals write-up", () => {
    const parsed = intakeFormSchema.parse({
      ...virtualIntake,
      existingDogId: "dog_1",
      goals: "",
    });
    expect(parsed.existingDogId).toBe("dog_1");
  });

  it("rejects missing consent", () => {
    const parsed = intakeFormSchema.safeParse({
      ...virtualIntake,
      consentDataStorage: false,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a short goals write-up for a new dog", () => {
    const parsed = intakeFormSchema.safeParse({
      ...virtualIntake,
      goals: "Recall",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid UK postcode for in-person sessions", () => {
    const parsed = intakeFormSchema.safeParse({
      ...virtualIntake,
      meetingType: "in_person",
      addressLine1: "10 Field Lane",
      city: "York",
      postcode: "NOT A POSTCODE",
    });
    expect(parsed.success).toBe(false);
  });

  it("lets the trainer keep an older place answer and add notes", () => {
    const parsed = trainerIntakeSchema.parse({
      ...virtualIntake,
      dogId: "dog_1",
      hasGround: "yes",
      trainerNotes: "Stop is coming. Keep the first retrieves short.",
    });
    expect(parsed.hasGround).toBe("yes");
    expect(parsed.trainerNotes).toBe("Stop is coming. Keep the first retrieves short.");
  });
});
