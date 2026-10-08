import { Prisma, PrismaClient } from "@prisma/client";
import { isDatabaseUnavailableMessage } from "@/lib/database-availability";

const CLIENT_REVISION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRevision: number | undefined;
};

function modelDelegateKey(modelName: string) {
  return modelName.slice(0, 1).toLowerCase() + modelName.slice(1);
}

function isStalePrismaClient(client: PrismaClient) {
  return Object.values(Prisma.ModelName).some((modelName) => {
    const key = modelDelegateKey(modelName);
    return (client as unknown as Record<string, unknown>)[key] == null;
  });
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });
  client.$on("error", (event) => {
    if (isDatabaseUnavailableMessage(event.message)) {
      return;
    }
    console.error(event.message);
  });
  client.$on("warn", (event) => {
    console.warn(event.message);
  });
  return client;
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && globalForPrisma.prismaRevision === CLIENT_REVISION && !isStalePrismaClient(cached)) {
    return cached;
  }
  if (cached) {
    void cached.$disconnect();
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaRevision = CLIENT_REVISION;
  }
  return client;
}

export const prisma = getPrismaClient();
