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
    hero:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=80",
    about:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80",
    field:
      "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=1200&q=80",
  },
} as const;

export const navigation = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;
