import { prisma } from "@/lib/prisma";

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: { pricePence: "asc" },
  });
}

export async function getPublishedTestimonials() {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
}
