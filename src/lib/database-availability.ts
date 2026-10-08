import { Prisma } from "@prisma/client";

const UNAVAILABLE_MESSAGE =
  /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|Can't reach database server|Tenant or user not found|tenant\/user/i;

const RETRY_AFTER_MS = 30_000;
let downUntil = 0;

export function rememberDatabaseDown(now = Date.now()) {
  downUntil = now + RETRY_AFTER_MS;
}

export function rememberDatabaseUp() {
  downUntil = 0;
}

export function databaseRecentlyDown(now = Date.now()) {
  return now < downUntil;
}

export function isDatabaseUnavailableMessage(message: string) {
  return UNAVAILABLE_MESSAGE.test(message);
}

export function isDatabaseUnavailable(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P1001" || error.code === "P1002" || error.code === "P1017")
  ) {
    return true;
  }
  return error instanceof Error && isDatabaseUnavailableMessage(error.message);
}
