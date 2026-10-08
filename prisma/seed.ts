import { PrismaClient } from "@prisma/client";
import { sampleServiceRows } from "../src/lib/sample-services";

const prisma = new PrismaClient();

async function main() {
  for (const service of sampleServiceRows) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    });
  }

  const testimonials = [
    {
      quote:
        "Our spaniel's recall improved dramatically after just two sessions. Professional, patient, and clearly passionate about gundogs.",
      author: "Sarah M.",
      isPublished: false,
      sortOrder: 1,
    },
    {
      quote:
        "The virtual sessions were perfect for us - flexible scheduling and practical advice we could use straight away in the field.",
      author: "James T.",
      isPublished: false,
      sortOrder: 2,
    },
    {
      quote:
        "Highly recommend. Clear communication, fair pricing, and a real understanding of working breeds.",
      author: "Emma R.",
      isPublished: false,
      sortOrder: 3,
    },
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { author: testimonial.author, quote: testimonial.quote },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
    } else if (existing.isPublished) {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: { isPublished: false },
      });
    }
  }

  const availabilityRules = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
  ];

  for (const rule of availabilityRules) {
    await prisma.availabilityRule.upsert({
      where: {
        dayOfWeek_startTime_endTime: {
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
        },
      },
      update: {},
      create: rule,
    });
  }

  console.log("Seed completed: services, testimonials, and availability rules.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
