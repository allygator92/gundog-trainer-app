import { describe, expect, it } from "vitest";
import { consentedAtFromIntake, intakePdfValues, intakeRecordDefaults } from "@/lib/intake-record";

const dog = { id: "dog-1", name: "Lana", breed: "Cocker", intakeData: null };
const client = { name: "Alison Grant", email: "owner@example.com", phone: "07000000000" };

describe("intakeRecordDefaults", () => {
  it("fills owner and dog details when the stored intake is empty", () => {
    const defaults = intakeRecordDefaults(dog, client);
    expect(defaults.dogId).toBe("dog-1");
    expect(defaults.ownerName).toBe("Alison Grant");
    expect(defaults.ownerEmail).toBe("owner@example.com");
    expect(defaults.dogName).toBe("Lana");
    expect(defaults.breed).toBe("Cocker");
    expect(defaults.meetingType).toBe("virtual");
    expect(defaults.trainerNotes).toBe("");
    expect(defaults.ageYears).toBe("0");
  });

  it("keeps stored answers, including trainer notes", () => {
    const defaults = intakeRecordDefaults(
      {
        ...dog,
        intakeData: {
          ownerName: "Stored name",
          meetingType: "in_person",
          ageYears: 3,
          ageMonths: 4,
          sex: "female",
          hasGround: "paddock",
          goals: "Steadiness",
          trainerNotes: "Stop is coming.",
          consentedAt: "2026-10-28T09:38:00.000Z",
        },
      },
      client,
    );

    expect(defaults.ownerName).toBe("Stored name");
    expect(defaults.meetingType).toBe("in_person");
    expect(defaults.ageYears).toBe("3");
    expect(defaults.ageMonths).toBe("4");
    expect(defaults.sex).toBe("female");
    expect(defaults.hasGround).toBe("paddock");
    expect(defaults.goals).toBe("Steadiness");
    expect(defaults.trainerNotes).toBe("Stop is coming.");
    expect(intakePdfValues(defaults).consentDataStorage).toBe(true);
    expect(intakePdfValues(defaults).ageYears).toBe(3);
    expect(consentedAtFromIntake(dog.intakeData, "fallback")).toBe("fallback");
    expect(consentedAtFromIntake(defaults && { consentedAt: "2026-10-28T09:38:00.000Z" }, "fallback")).toBe(
      "2026-10-28T09:38:00.000Z",
    );
  });
});
