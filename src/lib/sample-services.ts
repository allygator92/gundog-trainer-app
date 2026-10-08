import type { Service, ServiceType } from "@prisma/client";

export const sampleServiceRows: Array<{
  name: string;
  type: ServiceType;
  durationMinutes: number;
  pricePence: number;
  description: string;
}> = [
  {
    name: "Virtual Training Session",
    type: "virtual",
    durationMinutes: 60,
    pricePence: 6500,
    description:
      "A one-to-one video hour for whistle timing, handling, and homework. Shot, water, and cover need an in-person hour.",
  },
  {
    name: "In-Person Training Session",
    type: "in_person",
    durationMinutes: 90,
    pricePence: 9500,
    description:
      "Ninety minutes on your ground for the dog’s job: steadiness, dummy work, a spaniel’s pattern, or a retriever quiet at the peg.",
  },
];

export function sampleServices(): Service[] {
  const createdAt = new Date("2026-01-01T00:00:00.000Z");
  return sampleServiceRows.map((row) => ({
    id: `sample-${row.type}`,
    name: row.name,
    type: row.type,
    durationMinutes: row.durationMinutes,
    pricePence: row.pricePence,
    description: row.description,
    isActive: true,
    createdAt,
  }));
}
