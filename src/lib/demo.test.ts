import { afterEach, describe, expect, it } from "vitest";
import { demo } from "@content/demo";
import { adminDemoNoteForPath, formatCardNumber, isDemoEnabled, sampleNotesForPath } from "@/lib/demo";

describe("adminDemoNoteForPath", () => {
  it("returns overview notes on the admin home tab", () => {
    expect(adminDemoNoteForPath("/admin").title).toBe(demo.adminTabs.overview.title);
  });

  it("matches nested booking and waitlist routes", () => {
    expect(adminDemoNoteForPath("/admin/bookings/abc").title).toBe(demo.adminTabs.bookings.title);
    expect(adminDemoNoteForPath("/admin/waitlist").title).toBe(demo.adminTabs.waitlist.title);
  });
});

describe("formatCardNumber", () => {
  it("groups Stripe test card digits in fours", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  });
});

describe("isDemoEnabled", () => {
  const original = process.env.NEXT_PUBLIC_DEMO_MODE;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
    } else {
      process.env.NEXT_PUBLIC_DEMO_MODE = original;
    }
  });

  it("can be switched off with NEXT_PUBLIC_DEMO_MODE=false", () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    expect(isDemoEnabled()).toBe(false);
  });

  it("follows content/demo.ts when the env flag is not false", () => {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    expect(isDemoEnabled()).toBe(demo.enabled);
  });
});

describe("sampleNotesForPath", () => {
  it("labels the trainer area as Admin dashboard on the public site", () => {
    const titles = sampleNotesForPath("/book").map((note) => note.title);
    expect(titles).toContain("Admin dashboard");
    expect(titles.some((title) => title.toLowerCase().includes("what this dashboard"))).toBe(false);
  });

  it("puts the cookies note first on the cookies page", () => {
    expect(sampleNotesForPath("/cookies")[0]?.title).toBe(demo.cookies.title);
  });
});
