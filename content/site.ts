const unsplash = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const site = {
  name: "Gundog Trainer",
  tagline: "Calm, confident working dogs — in the field and at home.",
  description:
    "One-to-one gundog training for working breeds. Virtual and in-person sessions covering recall, steadiness, and field skills.",
  trainerName: "Alex Hart",
  trainerRole: "Professional gundog trainer",
  location: "United Kingdom",
  email: "hello@gundogtrainer.example",
  phone: "+44 7700 900123",
  phoneHref: "tel:+447700900123",
  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Facebook", href: "https://facebook.com/" },
  ],
  virtualMeetingNote:
    "For virtual sessions, the video call link is emailed the day before. No extra app install is required.",
  images: {
    hero: unsplash("photo-1668036065203-4f1b08f1fcf1", 1600),
    about: unsplash("photo-1556478094-bf761a15ef40"),
    field: unsplash("photo-1642017273035-f6d949467443"),
    urban: unsplash("photo-1444212477490-ca407925329e"),
    gallery: [
      {
        src: unsplash("photo-1668036065203-4f1b08f1fcf1", 1400),
        alt: "A working Labrador standing in open grassland, ready to hunt",
        caption: "Field work — hunting on the whistle in open cover",
        setting: "field" as const,
      },
      {
        src: unsplash("photo-1642017273035-f6d949467443"),
        alt: "A black retriever carrying a duck after a retrieve",
        caption: "Retrieving to hand — the job a gundog is built for",
        setting: "field" as const,
      },
      {
        src: unsplash("photo-1670505343033-ae36ef2854f9"),
        alt: "A gundog returning with a bird in its mouth",
        caption: "Game carrying with a soft mouth and a straight line back",
        setting: "field" as const,
      },
      {
        src: unsplash("photo-1670504717413-81ba2ae9435b"),
        alt: "A working dog standing in water after a retrieve",
        caption: "Water work — confidence in entry, swim, and delivery",
        setting: "field" as const,
      },
      {
        src: unsplash("photo-1556478094-bf761a15ef40"),
        alt: "A trainer working one-to-one with a gundog in the field",
        caption: "Handler and dog reading each other on the ground",
        setting: "field" as const,
      },
      {
        src: unsplash("photo-1514134952839-71312e5b823f"),
        alt: "A pointer-type gundog working through autumn cover",
        caption: "HPRs hunting cover — nose down, body still when they find",
        setting: "field" as const,
      },
      {
        src: unsplash("photo-1444212477490-ca407925329e"),
        alt: "Two dogs walking together on a town path",
        caption: "Town manners — the same breeds, a different kind of pressure",
        setting: "urban" as const,
      },
      {
        src: unsplash("photo-1601758228041-f3b2795255f1"),
        alt: "A handler working with a dog away from the shooting field",
        caption: "Urban sessions: recall, heel, and steadiness around people",
        setting: "urban" as const,
      },
    ],
  },
} as const;

export const navigation = [
  { href: "/about", label: "About" },
  { href: "/training", label: "Training" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;
