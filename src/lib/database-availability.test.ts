import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  databaseRecentlyDown,
  isDatabaseUnavailable,
  isDatabaseUnavailableMessage,
  rememberDatabaseDown,
  rememberDatabaseUp,
} from "@/lib/database-availability";

describe("isDatabaseUnavailable", () => {
  it("treats a missing database host as unavailable", () => {
    const error = new Prisma.PrismaClientInitializationError(
      "FATAL: (ENOTFOUND) tenant/user postgres.example not found",
      "6.12.0",
    );
    expect(isDatabaseUnavailable(error)).toBe(true);
    expect(isDatabaseUnavailableMessage(error.message)).toBe(true);
  });

  it("skips the database for a short while after it is down", () => {
    rememberDatabaseUp();
    expect(databaseRecentlyDown(1_000)).toBe(false);
    rememberDatabaseDown(1_000);
    expect(databaseRecentlyDown(1_000)).toBe(true);
    expect(databaseRecentlyDown(31_000)).toBe(false);
    rememberDatabaseUp();
  });

  it("leaves a missing row as a real query error", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "6.12.0",
    });
    expect(isDatabaseUnavailable(error)).toBe(false);
  });
});
