import { afterEach, describe, expect, it, vi } from "vitest";
import { isRateLimited, resetRateLimit } from "@/lib/rate-limit";

describe("isRateLimited", () => {
  afterEach(() => {
    resetRateLimit();
    vi.useRealTimers();
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

  it("allows a key again after the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-06T10:00:00.000Z"));
    expect(isRateLimited("test:e", 1, 1_000)).toBe(false);
    expect(isRateLimited("test:e", 1, 1_000)).toBe(true);
    vi.setSystemTime(new Date("2026-09-06T10:00:01.001Z"));
    expect(isRateLimited("test:e", 1, 1_000)).toBe(false);
    vi.useRealTimers();
  });
});
