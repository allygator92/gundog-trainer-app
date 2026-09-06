import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names and drops falsy values", () => {
    expect(cn("px-2", false && "hidden", "text-sm")).toBe("px-2 text-sm");
  });

  it("lets later Tailwind classes win", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
