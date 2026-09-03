export const STRIPE_TEST_CARD = "4242424242424242";

export const demo = {
  enabled: true,
  badge: "Sample site",
  launcherLabel: "Sample notes",
  welcome: {
    title: "You’re looking at a sample booking site",
    intro:
      "This is a working demo for trainers to click through as a client would. A few things are placeholders until the site is set up for a real business.",
    bullets: [
      "Brand name, phone, email, and social links are sample data — not a live trainer’s details.",
      "Photos are stock images. Swap them for your own dogs and ground.",
      "Heath and Field in the header are two looks for the public site. Try both.",
      "Live card payments need a Stripe account linked to a bank. On this sample you can still try checkout with Stripe’s test card (details on the pay step).",
      "Booking confirmation and reminder emails are sent by email (Resend). They do not appear in the admin dashboard, and they will not arrive until sending is switched on.",
    ],
    continueLabel: "Continue to the sample site",
  },
  payment: {
    title: "Payments are not live yet",
    body: "Real charges cannot be taken until Stripe is connected to a bank account. This sample can still open the Stripe checkout screen in test mode.",
    testCardLabel: "Stripe test card",
    testCardHint:
      "Use any future expiry date, any 3-digit CVC, and any postcode. No real money is taken in test mode.",
    afterPay:
      "A paid booking would email the client a confirmation with a cancel/reschedule link. You will not see that email in admin — only in the inbox, once Resend is configured.",
  },
  contact: {
    title: "Placeholder contact details",
    body: "The phone number, email, and social links are sample values (including hello@gundogtrainer.example). Messages still save under Admin → Enquiries even if notification email is not switched on.",
  },
  about: {
    title: "Placeholder trainer copy",
    body: "The trainer name, story, and photos are sample content. Replace them when this site is set up for a real practice.",
  },
  admin: {
    title: "What this dashboard does — and does not show",
    body: "Bookings, intakes, waitlist, and enquiries here are the real records for this demo database. Confirmation emails, day-before reminders, and waitlist “a time has opened” messages are not listed in admin: they go to the client’s inbox when Resend is configured. Prices, hours, and public copy are still sample data until you change them.",
  },
  login: {
    title: "Admin is for the trainer",
    body: "Sign in with the demo admin account you were given. This is not the public booking form.",
  },
} as const;
