import { describe, expect, it } from "vitest";
import { formatIntakeAddress, intakeFormSchema } from "@/lib/validations/intake";

const virtualIntake = {
  ownerName: "Sam Owner",
  ownerEmail: "sam@example.com",
  meetingType: "virtual" as const,
  dogName: "Moss",
  breed: "Labrador",
  ageYears: 3,
  sex: "male" as const,
  neutered: true,
  recall: "fair" as const,
  leadWalking: "good" as const,
  goals: "Improve recall in the field",
  consentDataStorage: true,
};

describe("intakeFormSchema", () => {
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

  it("rejects missing consent", () => {
    const parsed = intakeFormSchema.safeParse({
      ...virtualIntake,
      consentDataStorage: false,
    });
    expect(parsed.success).toBe(false);
  });
});
