import { site } from "./site";

export const privacyContent = {
  title: "Privacy policy",
  updated: "31 August 2026",
  sections: [
    {
      heading: "Who we are",
      body: `${site.name} (“we”) provides gundog training. This policy explains how we use personal information you send through this website.`,
    },
    {
      heading: "What we collect",
      body: "When you contact us or complete a dog intake form we store your name, email, phone if you give it, address for in-person sessions, and details about your dog. We also store the date and time you agreed to this.",
    },
    {
      heading: "Why we use it",
      body: "We use this information to reply to you, prepare training, keep records of sessions, and (when booking is live) manage payments. We do not sell your data.",
    },
    {
      heading: "How long we keep it",
      body: "We keep client and dog records while we are working with you and for a reasonable period afterwards so we can refer back to training notes. You can ask us to delete your data at any time.",
    },
    {
      heading: "Your rights",
      body: "You can ask for a copy of the information we hold, ask us to correct it, or ask us to delete it. Email us using the address on the contact page.",
    },
  ],
} as const;
