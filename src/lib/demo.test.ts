import { describe, expect, it } from "vitest";
import { demo } from "@content/demo";
import { adminDemoNoteForPath, sampleNotesForPath } from "@/lib/demo";

describe("adminDemoNoteForPath", () => {
  it("returns overview notes on the admin home tab", () => {
    expect(adminDemoNoteForPath("/admin").title).toBe(demo.adminTabs.overview.title);
  });

  it("matches nested booking and waitlist routes", () => {
    expect(adminDemoNoteForPath("/admin/bookings/abc").title).toBe(demo.adminTabs.bookings.title);
    expect(adminDemoNoteForPath("/admin/waitlist").title).toBe(demo.adminTabs.waitlist.title);
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
