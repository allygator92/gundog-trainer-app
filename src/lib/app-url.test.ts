import { describe, expect, it } from "vitest";
import { getAppUrl } from "@/lib/app-url";

describe("getAppUrl", () => {
  it("uses a valid NEXT_PUBLIC_APP_URL", () => {
    expect(getAppUrl({ NEXT_PUBLIC_APP_URL: "https://example.com/" })).toBe("https://example.com");
  });

  it("ignores an empty NEXT_PUBLIC_APP_URL and uses Vercel’s host", () => {
    expect(
      getAppUrl({
        NEXT_PUBLIC_APP_URL: "",
        VERCEL_URL: "gundog-trainer-app.vercel.app",
      }),
    ).toBe("https://gundog-trainer-app.vercel.app");
  });

  it("falls back to localhost when nothing valid is set", () => {
    expect(getAppUrl({ NEXT_PUBLIC_APP_URL: "   " })).toBe("http://localhost:3000");
  });

  it("ignores a non-http NEXT_PUBLIC_APP_URL", () => {
    expect(getAppUrl({ NEXT_PUBLIC_APP_URL: "ftp://example.com" })).toBe("http://localhost:3000");
  });

  it("prefers the production Vercel host over the deployment host", () => {
    expect(
      getAppUrl({
        VERCEL_PROJECT_PRODUCTION_URL: "gundog.example",
        VERCEL_URL: "gundog-trainer-git-main.vercel.app",
      }),
    ).toBe("https://gundog.example");
  });
});
