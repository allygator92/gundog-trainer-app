import { afterEach, describe, expect, it } from "vitest";
import { isRateLimited, resetRateLimit } from "@/lib/rate-limit";

describe("isRateLimited", () => {
  afterEach(() => {
    resetRateLimit();
  });

  it("allows requests under the limit", () => {
    expect(isRateLimited("test:a", 2, 60_000)).toBe(false);
    expect(isRateLimited("test:a", 2, 60_000)).toBe(false);
  });

  it("blocks the request that exceeds the limit", () => {
    isRateLimited("test:b", 2, 60_000);
    isRateLimited("test:b", 2, 60_000);
    expect(isRateLimited("test:b", 2, 60_000)).toBe(true);
  });

  it("tracks keys separately", () => {
    isRateLimited("test:c", 1, 60_000);
    expect(isRateLimited("test:c", 1, 60_000)).toBe(true);
    expect(isRateLimited("test:d", 1, 60_000)).toBe(false);
  });
});
