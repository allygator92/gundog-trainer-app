import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [dogs, documents, clients] = await Promise.all([
    prisma.dog.count(),
    prisma.document.count({ where: { type: "intake_pdf" } }),
    prisma.client.count(),
  ]);
  console.log(JSON.stringify({ dogs, intakePdfs: documents, clients }));
}

main().finally(() => prisma.$disconnect());
