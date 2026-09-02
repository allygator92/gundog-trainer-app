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
      body: "When you contact us or complete a dog intake form we store your name, email, phone if you give it, address for in-person sessions, and details about your dog. We store the date and time you agreed to this. If you book, we also store the session time, payment status, and Stripe identifiers (not your full card number). Files you or we upload (intake PDFs, extra records) are kept in a private storage bucket.",
    },
    {
      heading: "Why we use it",
      body: "We use this information to reply to you, prepare training, keep records of sessions, take payment, and send confirmation emails. We do not sell your data. Payments are processed by Stripe. Emails are sent by Resend.",
    },
    {
      heading: "How long we keep it",
      body: "We keep client and dog records while we are working with you and for up to 24 months afterwards so we can refer back to training notes, unless the law requires us to keep them longer (for example some payment records). You can ask us to delete your data at any time. The trainer can also delete a client record from the admin dashboard, which removes the database rows and private files we hold. Stripe may still hold payment records under their own retention rules.",
    },
    {
      heading: "Cookies",
      body: "We use a strictly necessary cookie to remember whether you chose the Heath or Field look, and a session cookie if you sign in as the trainer. We do not use advertising or analytics cookies. See the cookies page for names and lifetimes.",
    },
    {
      heading: "Your rights",
      body: "You can ask for a copy of the information we hold, ask us to correct it, or ask us to delete it. Email us using the address on the contact page. If you are unhappy with how we handle your data you can complain to the Information Commissioner’s Office (ICO).",
    },
  ],
} as const;

export const cookiesContent = {
  title: "Cookies",
  updated: "31 August 2026",
  intro:
    "This site uses a small number of cookies so it can work. We do not set advertising cookies.",
  rows: [
    {
      name: "gundog-theme",
      purpose: "Remembers whether you chose the Heath or Field look.",
      duration: "1 year",
    },
    {
      name: "Supabase auth cookies",
      purpose: "Keeps the trainer signed in on /admin. Not set for public visitors.",
      duration: "Session / refresh token lifetime set by Supabase",
    },
  ],
} as const;
