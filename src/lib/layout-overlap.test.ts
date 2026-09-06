import { describe, expect, it } from "vitest";
import { adminHeaderLayout } from "@/lib/admin-header-layout";
import { rectsOverlap, type Rect } from "@/lib/layout-overlap";

const phoneBrand: Rect = { x: 16, y: 16, width: 210, height: 36 };
const phoneToggle: Rect = { x: 230, y: 16, width: 140, height: 32 };
const phoneActions: Rect = { x: 16, y: 60, width: 358, height: 36 };
const overlappingActions: Rect = { x: 40, y: 12, width: 220, height: 40 };

describe("rectsOverlap", () => {
  it("does not treat boxes that only touch at an edge as overlapping", () => {
    expect(rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
  });

  it("detects the old admin header bug: action buttons sitting on top of the logo", () => {
    expect(rectsOverlap(phoneBrand, overlappingActions)).toBe(true);
  });

  it("allows brand + toggle on the first row and actions on the next row", () => {
    expect(rectsOverlap(phoneBrand, phoneToggle)).toBe(false);
    expect(rectsOverlap(phoneBrand, phoneActions)).toBe(false);
    expect(rectsOverlap(phoneToggle, phoneActions)).toBe(false);
  });
});

describe("adminHeaderLayout", () => {
  it("wraps action buttons onto their own full-width row on phones", () => {
    expect(adminHeaderLayout.bar).toContain("flex-wrap");
    expect(adminHeaderLayout.actions).toContain("w-full");
    expect(adminHeaderLayout.actions).toContain("flex-wrap");
    expect(adminHeaderLayout.actions).toContain("order-3");
  });

  it("keeps Heath/Field with the brand on phones and on the far right from tablet up", () => {
    expect(adminHeaderLayout.toggle).toContain("order-2");
    expect(adminHeaderLayout.toggle).toContain("sm:order-3");
    expect(adminHeaderLayout.actions).toContain("sm:order-2");
    expect(adminHeaderLayout.brand).toContain("min-w-0");
    expect(adminHeaderLayout.toggle).not.toContain("w-full");
  });
});
