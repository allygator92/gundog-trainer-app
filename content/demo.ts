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
      "Brand name, phone, email, and social links are sample data - not a live trainer’s details.",
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
      "A paid booking would email the client a confirmation with a cancel/reschedule link. You will not see that email in admin - only in the inbox, once Resend is configured.",
  },
  contact: {
    title: "Placeholder contact details",
    body: "Phone, email, and social links are not on the public page yet. Messages still save under Admin → Enquiries even if notification email is not switched on.",
  },
  about: {
    title: "Placeholder trainer copy",
    body: "The trainer name, story, and photos are sample content. Replace them when this site is set up for a real practice.",
  },
  cookies: {
    title: "Why this cookies page is here",
    body: "A live trainer site needs a clear list of what is stored, so this sample includes the same cookies page a client would see. The Heath/Field look cookie, admin sign-in cookies, and anonymous page/booking events are real behaviour of this demo - not advertising tracking.",
    untilLive:
      "On a live site you would still see this kind of page: the same strictly necessary cookies, named for the real business, with a short notice on the first visit. You would not normally see extra marketing cookies unless the trainer added them. Until the site is live, treat this as the pattern - the wording and domain will match the real practice once it is launched.",
  },
  admin: {
    title: "Admin dashboard",
    body: "The Admin dashboard is the trainer’s private area (sign in from /admin). Bookings, intakes, waitlist, and enquiries here are real records for this demo database. Confirmation emails, day-before reminders, and waitlist “a time has opened” messages are not listed in admin: they go to the client’s inbox when Resend is configured. Prices, hours, and public copy are still sample data until you change them.",
  },
  login: {
    title: "Admin dashboard sign in",
    body: "This sign-in is for the trainer, not the public booking form. Use the demo admin account you were given. After launch, only the trainer’s own login will work here.",
  },
  adminTabs: {
    overview: {
      title: "Admin dashboard - Overview",
      body: "This tab is a snapshot of the practice: today’s sessions, upcoming confirmed bookings, intakes waiting to be read, and recent contact messages. Counts come from this demo database, so you can click through as the trainer would.",
      untilLive:
        "Until the site is live you will not see client confirmation emails, day-before reminders, or payment payouts here. Those go out by email (Resend) and Stripe once they are connected. You also cannot take real card payments from this overview - that needs a Stripe account linked to a bank.",
    },
    bookings: {
      title: "Admin dashboard - Bookings",
      body: "Filter and open sessions, see who booked, which dog, payment status, and session time. From a booking you can follow the same cancel or reschedule path a client uses. Sample bookings in this database are real rows you can inspect.",
      untilLive:
        "Until Stripe and Resend are live, a paid booking will not take real money and will not email the client a confirmation with a manage link. You can still walk through the list and statuses on this demo. Refunds and bank payouts will not appear until the trainer’s Stripe account is connected.",
    },
    clients: {
      title: "Admin dashboard - Clients",
      body: "Owners appear here after they submit an intake or complete a booking. Open a client to see their dogs, session history, and private files. You can delete a demo client record; that removes the rows and stored files this site holds.",
      untilLive:
        "Until the site is live these are sample (or demo-created) people, not a real client list. Stripe may still keep payment records under its own rules even if you delete a row here. Exporting a full client list for another system is not included until you ask for it.",
    },
    availability: {
      title: "Admin dashboard - Availability",
      body: "Set weekly opening hours, lunch breaks, and blocked dates (holidays or days off). The public booking calendar only offers times that match these rules. Changes here update the book page for this demo immediately.",
      untilLive:
        "Hours and blocked dates on this sample are placeholders. Before taking real bookings you would set your actual week and block real holidays. Clients are not emailed when you change hours - they only see the calendar the next time they book.",
    },
    intakes: {
      title: "Admin dashboard - Intakes",
      body: "Dog intake forms submitted from the public site land here, with a link to the generated PDF. Open Intakes after you sign in - the login page itself does not list them. PDF links expire after 10 minutes for privacy.",
      untilLive:
        "Until file storage and Resend are configured for a live practice, new intakes may still save in this demo database but you will not get an email ping, and PDF download links need the private storage bucket to be connected. Clients do not see this tab.",
    },
    documents: {
      title: "Admin dashboard - Documents",
      body: "Intake PDFs and extra records you upload for a client. Downloads use a private link that expires after 10 minutes. You can attach a file to an existing client on this tab.",
      untilLive:
        "Until the live storage bucket is connected, files live in this demo’s private storage. Clients cannot browse documents from the public site. Signed downloads and extra record types are ready; they just need your live bucket and real client files.",
    },
    enquiries: {
      title: "Admin dashboard - Enquiries",
      body: "Messages from the public contact form. Name, email, phone, and the message are stored even if notification email is off, so you can still reply from here.",
      untilLive:
        "Until Resend is switched on you will not get an email when someone writes in - you need to check this tab. The sample contact details on the public site are placeholders; live, this list would be real enquiries to the trainer.",
    },
    analytics: {
      title: "Admin dashboard - Analytics",
      body: "Last 30 days of anonymous page views and booking steps (for example someone opened /book and left before paying). No names, emails, or IP addresses. Use it to see where people drop off.",
      untilLive:
        "Until the site is public you will mostly see demo traffic from people clicking through the sample. After launch this tab shows real visitor patterns. It is not Google Analytics and it does not build advertising profiles.",
    },
    waitlist: {
      title: "Admin dashboard - Waitlist",
      body: "People who asked to be emailed if a full day opens. They are stored here with the date they wanted. When a session on that date is cancelled, the live site emails them a link to book.",
      untilLive:
        "Until Resend is configured, joining the waitlist still saves a row you can see here, but the “a time has opened” email will not send. Waitlist is not offered for days or remaining times that have already passed.",
    },
    support: {
      title: "Admin dashboard - Support",
      body: "Raise a bug, a wording change, or something you would like added. Status updates stay on this tab so you can see what was sent and whether it is in progress.",
      untilLive:
        "This works on the sample site - you can send a request now. It is not a public contact form. After launch this remains the trainer’s channel for site changes; clients still use Contact or the booking flow.",
    },
  },
} as const;
