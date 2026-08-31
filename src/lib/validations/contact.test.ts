import { describe, expect, it } from "vitest";
import { contactFormSchema } from "@/lib/validations/contact";

describe("contactFormSchema", () => {
  const valid = {
    name: "Sam Owner",
    email: "sam@example.com",
    message: "Please can we talk about recall training?",
  };

  it("accepts a valid enquiry", () => {
    const parsed = contactFormSchema.parse(valid);
    expect(parsed.email).toBe("sam@example.com");
  });

  it("rejects a short name and message", () => {
    const parsed = contactFormSchema.safeParse({
      name: "S",
      email: "not-an-email",
      message: "Hi",
    });
    expect(parsed.success).toBe(false);
  });

  it("allows an empty optional phone", () => {
    const parsed = contactFormSchema.parse({ ...valid, phone: "" });
    expect(parsed.phone).toBeUndefined();
  });

  it("keeps a honeypot value for the server to drop", () => {
    const parsed = contactFormSchema.parse({ ...valid, website: "https://spam.example" });
    expect(parsed.website).toBe("https://spam.example");
  });
});
