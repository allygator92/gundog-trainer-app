import type { Service } from "@prisma/client";
import {
  databaseRecentlyDown,
  isDatabaseUnavailable,
  rememberDatabaseDown,
  rememberDatabaseUp,
} from "@/lib/database-availability";
import { prisma } from "@/lib/prisma";
import { sampleServices } from "@/lib/sample-services";

export async function getActiveServices(): Promise<{ services: Service[]; sample: boolean }> {
  if (databaseRecentlyDown()) {
    return { services: sampleServices(), sample: true };
  }
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { pricePence: "asc" },
    });
    rememberDatabaseUp();
    return { services, sample: false };
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }
    rememberDatabaseDown();
    return { services: sampleServices(), sample: true };
  }
}

export async function getPublishedTestimonials() {
  if (databaseRecentlyDown()) {
    return [];
  }
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
    rememberDatabaseUp();
    return testimonials;
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }
    rememberDatabaseDown();
    return [];
  }
}
