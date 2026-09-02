import { describe, expect, it } from "vitest";
import { parseSiteTheme, themeCookie } from "@/lib/theme";

describe("parseSiteTheme", () => {
  it("defaults to heath", () => {
    expect(parseSiteTheme(undefined)).toBe("heath");
    expect(parseSiteTheme("unknown")).toBe("heath");
  });

  it("accepts the field look", () => {
    expect(parseSiteTheme("field")).toBe("field");
  });

  it("writes a cookie the browser can keep", () => {
    expect(themeCookie("field")).toContain("gundog-theme=field");
    expect(themeCookie("field")).toContain("Path=/");
  });
});
