import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && !isStalePrismaClient(cached)) {
    return cached;
  }
  if (cached) {
    void cached.$disconnect();
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
