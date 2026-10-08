const unsplash = (id: string, width = 1200, focus = "faces") =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=${focus}&w=${width}&q=80`;

export const site = {
  name: "Gundog Trainer",
  tagline: "Pet gundog, beating line, picking-up, or peg dog.",
  description:
    "One-to-one gundog training for the job the dog will do: a calmer pet, beating, picking-up, a peg dog, or tests. Video hours cover whistle and homework. In-person hours are on the ground.",
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
    "A video hour can coach whistle timing, handling, and homework. It cannot cover shot, water, or cover. A reminder with the video call link is emailed the day before. No extra app install is required.",
  images: {
    hero: unsplash("photo-1668036065203-4f1b08f1fcf1", 1600),
    about: unsplash("photo-1556478094-bf761a15ef40"),
    field: unsplash("photo-1642017273035-f6d949467443"),
    gallery: [
      {
        src: unsplash("photo-1668036065203-4f1b08f1fcf1", 1400),
        alt: "A yellow Labrador standing in long grass",
        caption: "A Labrador standing in grass",
        setting: "field" as const,
        objectPosition: "58% 42%",
      },
      {
        src: unsplash("photo-1642017273035-f6d949467443"),
        alt: "A black Labrador sitting with a duck in its mouth",
        caption: "A Labrador holding a duck",
        setting: "field" as const,
        objectPosition: "50% 22%",
      },
      {
        src: unsplash("photo-1670505343033-ae36ef2854f9"),
        alt: "A German Shorthaired Pointer running through stubble with a bird",
        caption: "A pointer running with a bird",
        setting: "field" as const,
        objectPosition: "50% 28%",
      },
      {
        src: unsplash("photo-1670504717413-81ba2ae9435b"),
        alt: "A German Shorthaired Pointer shaking off in shallow water",
        caption: "A shake-off in shallow water",
        setting: "field" as const,
        objectPosition: "50% 24%",
      },
      {
        src: unsplash("photo-1556478094-bf761a15ef40"),
        alt: "A Gun with a shotgun and a pointer in the mist",
        caption: "A Gun and a pointer on a hill",
        setting: "field" as const,
        objectPosition: "62% 35%",
      },
      {
        src: unsplash("photo-1514134952839-71312e5b823f"),
        alt: "A springer spaniel sitting in woodland",
        caption: "A springer sitting in cover",
        setting: "field" as const,
        objectPosition: "50% 22%",
      },
    ],
  },
} as const;

export const navigation = [
  { href: "/about", label: "About" },
  { href: "/training", label: "Training" },
  { href: "/pricing", label: "Pricing" },
  { href: "/training#faq", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;
